
import { Subscriber, SubscriptionList, DeviceService } from './serviceLib.js';
import ServiceManager from './serviceManager.js';


function CustomSubscriber() {
    Subscriber.call(this, ...arguments);
    const commandIndicesByName = {
        setLampState: 1,
        executeGivenProgram: 2,
        executePreparedProgram: 4,
    }   
    this.handleRequest = function(_message) {
        let index = commandIndicesByName[_message.type];
        if (index) return this.service.send({type: index, data: _message.data});
        switch (_message.type)
        {
            case "prepareProgram": 
                if (!_message.data) return this.onEvent({error: "Data missing", message: _message});
                _message.data.trigger = filterTriggerString(_message.data.trigger);
                this.service.curState.preparedProgram = _message.data;
                if (!_message.data.trigger) this.service.curState.preparedProgram = false;
                this.service.send({type: 3, data: _message.data});
                this.service.pushCurState();
            break;
        }
    }

    function filterTriggerString(_str) {
        try {
            let parts = _str.split(':');
            let hours = parseInt(parts[0]);
            let minutes = parseInt(parts[1]);
            
            while (hours < 0) hours += 24;
            while (hours > 23) hours -= 24;
            while (minutes < 0) minutes += 60;
            while (minutes > 59) minutes -= 60;

            return intToTwoCharString(hours) + ":" + intToTwoCharString(minutes);
        } catch (e) {return false;} // Will never happen
    }
    function intToTwoCharString(_int) {
        if (_int > 9) return String(_int);
        return "0" + _int;
    }
}

export default new function() {
    const This = this;
    DeviceService.call(this, {
        id: 'CableLamp',
        SubscriberTemplate: CustomSubscriber,
        onMessage: onMessage
    });

    function onMessage(_message) {
        switch (_message.type)
        {
            case "lampStatus": This.curState.lampOn = _message.data; break;
        }
        This.pushEvent(_message);
    }

    this.subscriptions = [];
    this.setup = function() {
        this.subscriptions = new SubscriptionList([
            ServiceManager.getService('MovementTracker').subscribe({onEvent: handleMovementTrackerEvent}),
        ]);
    }

    function handleMovementTrackerEvent(_event) {
        console.log('turn lights off?', _event);
        if (_event.type != 'status') return;
        if (_event.data.isAtHome) return;
        This.send({type: 1, data: false}); // Turn the lamp off
    }

    this.onDeviceConnect = () => {
        if (!this.curState.preparedProgram) return;
        this.send({type: 3, data: this.curState.preparedProgram});
    }
}











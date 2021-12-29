
import { Subscriber, DeviceService } from './serviceLib.js';

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
            case "setProgram": 
                _message.data.trigger = filterTriggerString(_message.data.trigger);
                if (!_message.data.trigger) return this.onEvent({error: "Invalid Trigger", message: _message});
                this.service.curState.preparedProgramConfig = _message.data;
                this.service.send({type: 3, data: _message.data});
            break;
        }
    }

    function filterTriggerString(_str) {
        try {
            let parts = _str.split(':');
            return intToTwoCharString(parseInt(parts[0])) + ":" + intToTwoCharString(parseInt(parts[1]));
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


    this.onDeviceConnect = () => {
        if (!this.curState.preparedProgramConfig) return;
        this.send({type: 3, data: this.curState.preparedProgramConfig});
    }
}











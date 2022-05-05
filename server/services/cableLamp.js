import { Subscriber, SubscriptionList, DeviceService, ServiceFileManager } from '../serviceLib.js';


function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    async function handleRequest(_message) {
        // Intercept messages
        switch (_message.type)
        {
            case "getPrograms": 
                return This.onEvent({type: "programs", data: await This.service.programManager.getPrograms()});
            case "getAlarmData": 
                return This.onEvent({type: "alarmData", data: await This.service.alarmManager.getAlarm()});
        }

        // Servermodified messages
        switch (_message.type)
        {
            case "prepareProgram": 
                if (!_message.data) return This.onEvent({error: "Data missing", message: _message});
                _message.data.trigger = filterTriggerString(_message.data.trigger);
                if (_message.data.programIndex === false) _message.data.trigger = '';
                
                This.service.send(_message);
                This.service.alarmManager.setAlarm(_message.data);
                This.service.pushCurState();
            break;
        }

        // Default messages
        return This.service.send(_message);
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

export default function() {
    const This = this;
    DeviceService.call(this, {
        id: 'CableLamp',
        SubscriberTemplate: CustomSubscriber,
    });
    this.programManager = new function() {
        let fm = new ServiceFileManager({path: "programs.json", defaultValue: []}, This);
        this.getPrograms = async function() {
            return await fm.getContent();
        }
    }
    this.alarmManager = new function() {
        let fm = new ServiceFileManager({path: "alarm.json", defaultValue: {programIndex: 0, trigger: "08:00"}}, This);
        this.getAlarm = async function() {
            return await fm.getContent();
        }
        this.setAlarm = async function(_data) {
            let data = {programIndex: _data.programIndex, trigger: _data.trigger};
            if (!data.trigger || !_data) data = {};
            This.curState.alarm = data;
            return await fm.writeContent(data);
        }
    }

    this.setup = async function() {
        this.curState.alarm = await this.alarmManager.getAlarm();
    }


    this.onWantedServiceLoad = function(service) {
        let eventHandler = handleMovementTrackerEvent;
        switch (service.id)
        {
            case 'MovementTracker': eventHandler = handleMovementTrackerEvent; break;
            default: return;
        }
        this.subscriptions.push(service.subscribe({onEvent: eventHandler}));
    }


    function handleMovementTrackerEvent(_event) {
        if (_event.type != 'status') return;
        if (_event.data.isAtHome) return;
        This.send({type: 1, data: false}); // Turn the lamp off
    }


    this.onDeviceConnect = async () => {
        if (!this.curState.alarm || !this.curState.alarm.trigger) return;
        let program = (await this.programManager.getPrograms())[this.curState.alarm.programIndex];
        if (!program) return;
        let data = {
            trigger: this.curState.alarm.trigger,
            program: program.program
        }
        this.send({type: 'prepareProgram', data: data});
    }
}











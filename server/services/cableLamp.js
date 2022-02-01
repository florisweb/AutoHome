
import { Subscriber, SubscriptionList, DeviceService, ServiceFileManager } from './serviceLib.js';
import ServiceManager from './serviceManager.js';


function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    const commandIndicesByName = {
        setLampState: 1,
        executeGivenProgram: 2,
        executePreparedProgram: 4,
    }   
    async function handleRequest(_message) {
        switch (_message.type)
        {
            case "getPrograms": 
                return This.onEvent({type: "programs", data: await This.service.programManager.getPrograms()});
            case "getAlarmData": 
                return This.onEvent({type: "alarmData", data: await This.service.alarmManager.getAlarm()});
        }

        let index = commandIndicesByName[_message.type];
        if (index) return This.service.send({type: index, data: _message.data});
        switch (_message.type)
        {
            case "prepareProgram": 
                if (!_message.data) return This.onEvent({error: "Data missing", message: _message});
                _message.data.trigger = filterTriggerString(_message.data.trigger);
                This.service.alarmManager.setAlarm(_message.data);

                This.service.send({type: 3, data: _message.data});
                This.service.pushCurState();
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
            let data = {programIndex: _data.programIndex, trigger: data.trigger};
            if (!data.trigger || !_data) data = {};
            This.curState.alarm = data;
            return await fm.writeContent(data);
        }
    }


    function onMessage(_message) {
        switch (_message.type)
        {
            case "lampStatus": This.curState.lampOn = _message.data; break;
        }
        This.pushEvent(_message);
    }

    this.subscriptions = [];
    this.setup = async function() {
        this.subscriptions = new SubscriptionList([
            ServiceManager.getService('MovementTracker').subscribe({onEvent: handleMovementTrackerEvent}),
        ]);
        this.curState.alarm = await this.alarmManager.getAlarm();
    }

    function handleMovementTrackerEvent(_event) {
        if (_event.type != 'status') return;
        if (_event.data.isAtHome) return;
        This.send({type: 1, data: false}); // Turn the lamp off
    }

    this.onDeviceConnect = async () => {
        if (!this.curState.alarm || !this.curState.alarm.trigger) return;
        let program = (await this.programManager.getPrograms())[this.curState.alarm.programIndex];
        let data = {
            trigger: this.curState.alarm.trigger,
            program: program.program
        }
        this.send({type: 3, data: data});
    }
}











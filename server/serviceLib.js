import ServiceManager from './serviceManager.js';
import Errors from './errors.js';
import { FileManager } from './DBManager.js';


export function Service({id, SubscriberTemplate = Subscriber}) {
    console.log('[Service] Loaded ' + id);
    this.subscribers    = [];
    this.id             = id;
    this.key            = ServiceManager.config.services[id].key;
    this.config         = ServiceManager.config.services[id];

    this.enabled            = false;
    this.requiredServices   = this.config.requires ? this.config.requires : [];
    this.wantedServices     = this.config.wants ? this.config.wants : [];

    
    this.curState       = {};
    this.subscriptions  = new SubscriptionList([]);

    this.setup = () => {};
    this.enable = () => {};
    this.authenticate = (_key) => {
        if (!this.key) return true;
        return this.key == _key;
    }

    this.pushEvent = function(_event) {
        for (let subscriber of this.subscribers) subscriber.onEvent(_event);
    }

    this.pushCurState = function(_sub) {
        let event = {type: "curState", data: this.curState};
        if (!_sub) return this.pushEvent(event);
        _sub.onEvent(event);
    }


    this.subscribe = function(_subscriber) {
        let sub = new SubscriberTemplate(_subscriber);
        sub.service = this;
        this.subscribers.push(sub);
        this.pushCurState(sub);
        return sub;
    }

    this.onLoadRequiredServices = function(services) {};
    this.onWantedServiceLoad = function(service) {};
}




export function DeviceService({id, onMessage}) {
    Service.call(this, ...arguments);
    this.downTimeTracker = new Service_downTimeTracker(this);
    this.curState       = {deviceOnline: false};

    this.client         = false;
    this.setDevicesClient = (_deviceClient) => {
        let isNewClient = this.client ? _deviceClient.id != this.client.id : true;
        this.client = _deviceClient;
        this.curState.deviceOnline = !!this.client;

        if (!isNewClient) return;
        this.downTimeTracker.updateConnectionState(!!this.client);

        this.pushEvent({
            type: "onlineStatusUpdate",
            data: this.curState.deviceOnline
        });
        if (this.client) return this.onDeviceConnect();
        this.onDeviceDisconnect();
    }

    this.onDeviceConnect = () => {};
    this.onDeviceDisconnect = () => {};


    this.onMessage = (_message) => {
        switch (_message.type)
        {
            case "setStateByKey": 
                this.curState[_message.stateKey] = _message.data;
                this.pushCurState();
            break;
            default:
                try {
                    onMessage(_message);
                } catch (e) {console.log(e)};
            break;
        }
    }
    this.send = function(_data) {
        if (!this.client) return Errors.NotConnectedService;
        this.client.send(JSON.stringify(_data));
    }
}




export function ServiceFileManager({path, defaultValue = {}}, _service) {
    let fm = new FileManager(_service.id + "_" + path);
    this.getContent = () => {
        return new Promise((resolve) => {
            fm.getContent().then((_result) => {
                if (typeof _result != 'object') return resolve(defaultValue);
                resolve(_result);
            }, () => resolve(defaultValue));
        });
    }
    this.writeContent = function() {
        return new Promise((resolve) => {
            fm.writeContent(...arguments).then(
                (_result) => {resolve(_result)}, 
                () => {resolve(false)}
            );
        })
        
    };
}


function Service_downTimeTracker(_parent) {
    let fm = new ServiceFileManager({path: "downTime.json", defaultValue: []}, _parent);
    this.getData = function() {return fm.getContent(...arguments)};

    this.updateConnectionState = async function(_connected) {
        let data = await this.getData();
        let curDateTime = new Date();
        curDateTime.setHours(0);
        curDateTime.setMinutes(0);
        curDateTime.setSeconds(0);
        const minTime = curDateTime.getTime() - 1000 * 60 * 60 * 24 * 6; // 7 days
        // Filter the data so it will only be one week old
        for (let i = data.length - 1; i >= 0; i--)
        {
            if (data[i][0] > minTime) continue;
            
            if (data[i].length == 2 && data[i][1] < minTime)
            {
                data.splice(i, 1);
            } else data[i][0] = minTime;
        }




        let lastSet = data[data.length - 1];
        if (!lastSet) // Data init
        {
            if (!_connected) return;
            data[0] = [Date.now()];
            return fm.writeContent(data);
        }

        if (_connected)
        {
            if (lastSet.length == 1) return;
            let newSet = [Date.now()]
            data.push(newSet);
            return fm.writeContent(data);
        }

        if (lastSet.length != 1) return;
        data[data.length - 1][1] = Date.now();
        return fm.writeContent(data);
    }
}













export function SubscriptionList(_list = []) {
    _list.get = (_id) => {
        return _list.find((sub) => {return sub.service.id == _id});
    }
    return _list;
}




export function Subscriber({onEvent, handleRequest = () => {}}) {
    this.service = false;
    this.onEvent = (_data) => {return onEvent(_data)}; // Given by client

    this.handleRequest = async (_message) => { // Given by service
        switch (_message.type )
        {
            case "getDownTime": 
                let data = await this.service.downTimeTracker.getData();
                return this.onEvent({type: "downTime", data: data});
            default: 
                try {
                    return handleRequest(_message);
                } catch (e) {console.log(this.service.id, "subscriber had an error", e)};
        }
    }
}


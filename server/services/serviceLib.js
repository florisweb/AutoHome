import ServiceConfig from './serviceConfig.js';
import Errors from '../errors.js';


export function Service({id, SubscriberTemplate = Subscriber}) {
    console.log('[Service] Loaded ' + id);
    this.subscribers    = [];
    this.id             = id;
    this.key            = ServiceConfig.services[id].key;
    this.config         = ServiceConfig.services[id];
    
    this.client         = false;
    this.curState = {};
    this.setDevicesClient = (_deviceClient) => {
        this.client = _deviceClient;
        console.log("onlineStatusUpdate", !!this.client);
        this.pushEvent({
            type: "onlineStatusUpdate",
            data: !!this.client
        });
        this.curState.deviceOnline = !!this.client;
        if (this.client) return this.onDeviceConnect();
        this.onDeviceDisconnect();
    }
    this.onDeviceConnect = () => {};
    this.onDeviceDisconnect = () => {};

    this.setup = () => {};
    this.authenticate = (_key) => {
        if (!this.key) return true;
        return this.key == _key;
    }

    this.pushEvent = function(_event) {
        for (let subscriber of this.subscribers) subscriber.onEvent(_event);
    }
    this.subscribe = function(_subscriber) {
        let sub = new SubscriberTemplate(_subscriber);
        sub.service = this;
        this.subscribers.push(sub);
        this.pushCurState(sub);
        return sub;
    }

    this.pushCurState = function(_sub) {
        let event = {type: "curState", data: this.curState};
        if (!_sub) return this.pushEvent(event);
        _sub.onEvent(event);
    }
}



export function DeviceService({id, onMessage}) {
    Service.call(this, ...arguments);
    this.onMessage = (_event) => {
        try {
            onMessage(_event);
        } catch (e) {console.log(e)};
    }
    this.send = function(_data) {
        if (!this.client) return Errors.NotConnectedService;
        this.client.send(JSON.stringify(_data));
    }
}


export function SubscriptionList(_list = []) {
    _list.get = (_id) => {
        return _list.find((sub) => {return sub.service.id == _id});
    }
    return _list;
}

export function Subscriber({onEvent}) {
    this.service = false;
    this.onEvent = onEvent;

    this.handleRequest = () => {console.log('Subscriber doesn\'t have the handleRequest-function set')}
}


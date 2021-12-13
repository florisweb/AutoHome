const ServiceKeys = require('./serviceKeyManager.js').keys;
const Errors = require('./errors.js').errors;


function Service({id, SubscriberTemplate = Subscriber}) {
    this.subscribers    = [];
    this.id             = id;
    this.key            = ServiceKeys[id];
    this.client         = false;
    
    this.authenticate = (_key) => {
        if (!this.key) return true;
        return this.key == _key;
    }

    this.onMessage = (_event) => {console.log('Service doesn\'t have onMessage set', this.id);}
    this.pushEvent = function(_event) {
        for (let subscriber of this.subscribers) subscriber.onEvent(_event);
    }
    this.subscribe = function(_subscriber) {
        let sub = new SubscriberTemplate(_subscriber);
        sub.service = this;
        this.subscribers.push(sub);
        return sub;
    }
}



function DeviceService({id}) {
    Service.call(this, ...arguments);

    this.send = function(_data) {
        if (!this.client) return Errors.NotConnectedService;
        this.client.send(JSON.stringify(_data));
    }
}


function Subscriber({onEvent}) {
    this.service = false;
    this.onEvent = onEvent;

    this.handleRequest = () => {console.log('Subscriber doesn\'t have the handleRequest-function set')}
}


exports.Service         = Service;
exports.DeviceService   = DeviceService;
exports.Subscriber      = Subscriber;





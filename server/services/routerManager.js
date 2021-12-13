const ServiceLib = require('./serviceLib.js');
const CableLamp = require('./cableLamp.js').service;

function Subscriber() {
    ServiceLib.Subscriber.call(this, ...arguments);
    this.handleRequest = function(_message) {}
}

exports.service = new function() {
    const This = this;
    ServiceLib.Service.call(this, {
        id: 'RouterManager',
        SubscriberTemplate: Subscriber
    });
    
   
}











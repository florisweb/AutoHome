const ServiceLib = require('./serviceLib.js');
const CableLamp = require('./cableLamp.js').service;

function Subscriber() {
    ServiceLib.Subscriber.call(this, ...arguments);
    this.handleRequest = function(_message) {}
}

exports.service = new function() {
    const This = this;
    ServiceLib.Service.call(this, {
        id: 'MovementTracker',
        SubscriberTemplate: Subscriber
    });
    
    this.subscriptions = new ServiceLib.SubscriptionList([
        CableLamp.subscribe({onEvent: handleCableLampEvent})
    ]);

    this.isInRoom = false;
    this.isAtHome = false;

    function handleCableLampEvent(_event) {
        if (_event.type != 'buttonPressed') return;

        let wasInRoom = This.isInRoom;
        This.isInRoom = true;
        This.isAtHome = true;
        
        if (wasInRoom) return;
        This.pushEvent({
            type: "status",
            isInRoom: This.isInRoom,
            isAtHome: This.isAtHome,
        });
    }
}











const Service = require('./service.js');
const CableLamp = require('./cableLamp.js').service;

/*
    Messages:
    type:
        lampSatus -> data: lampOn



*/

function Subscriber() {
    Service.Subscriber.call(this, ...arguments);

    this.handleRequest = function(_message) {}
}


exports.service = new function() {
    const This = this;
    Service.Service.call(this, {
        id: 'MovementTracker',
        SubscriberTemplate: Subscriber
    });
    
    this.subscriptions = new Service.SubscriptionList([
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











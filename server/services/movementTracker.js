
import { Subscriber, Service, SubscriptionList } from './serviceLib.js';
import ServiceManager from './serviceManager.js';

function CustomSubscriber() {
    Subscriber.call(this, ...arguments);
    this.handleRequest = function(_message) {}
}

export default new function() {
    const This = this;
    Service.call(this, {
        id: 'MovementTracker',
        SubscriberTemplate: CustomSubscriber
    });
        
    this.subscriptions = [];
    this.setup = function() {
        this.subscriptions = new SubscriptionList([
            ServiceManager.getService('CableLamp').subscribe({onEvent: handleCableLampEvent}),
            ServiceManager.getService('RouterManager').subscribe({onEvent: handleRouterEvent})
        ]);
    }

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
    function handleRouterEvent(_event) {
    }
}











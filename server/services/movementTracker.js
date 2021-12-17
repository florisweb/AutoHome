
import { Subscriber, Service, SubscriptionList } from './serviceLib.js';
import CableLamp from './cableLamp.js';
import RouterManager from './routerManager.js';

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
    
    this.subscriptions = new SubscriptionList([
        CableLamp.subscribe({onEvent: handleCableLampEvent}),
        RouterManager.subscribe({onEvent: handleRouterEvent})
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
    function handleRouterEvent(_event) {
        console.log('routerevent', _event);
    }
}











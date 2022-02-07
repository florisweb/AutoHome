
import { Subscriber, Service, SubscriptionList } from '../serviceLib.js';

function CustomSubscriber() {
    Subscriber.call(this, ...arguments);
}

export default new function() {
    const This = this;
    Service.call(this, {
        id: 'MovementTracker',
        SubscriberTemplate: CustomSubscriber
    });

    this.curState = {
        isInRoom: false,
        isAtHome: false,
    }
        
    
    this.onWantedServiceLoad = function(service) {
        let eventHandler = handleCableLampEvent;
        switch (service.id)
        {
            case 'RouterManager':     eventHandler = handleRouterEvent; break;
            case 'CableLamp':         eventHandler = handleCableLampEvent; break;
            default: return;
        }
        this.subscriptions.push(service.subscribe({onEvent: eventHandler}));
    }



    function handleCableLampEvent(_event) {
        if (_event.type != 'buttonPressed') return;

        let wasInRoom = This.curState.isInRoom;
        This.curState.isInRoom = true;
        This.curState.isAtHome = true;
        
        if (wasInRoom) return;
        This.pushEvent({
            type: "status",
            data: {
                isInRoom: This.curState.isInRoom,
                isAtHome: This.curState.isAtHome,
                trigger: "CableLamp"
            }
        });
    }
    function handleRouterEvent(_event) {
        if (_event.type != "deviceDisconnected") return;
        if (_event.data.type != 'phone') return;
        This.curState.isInRoom = false;
        This.curState.isAtHome = false;
        
        This.pushEvent({
            type: "status",
            data: {
                isInRoom: This.curState.isInRoom,
                isAtHome: This.curState.isAtHome,
                trigger: "Router",
            }
        });
    }
}











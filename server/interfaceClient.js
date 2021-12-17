import Config from './config.js';
import ServiceManager from './services/serviceManager.js';
import { SubscriptionList } from './services/serviceLib.js';


export function authenticateInterfaceClient(_encryptedString) {
    try {
        // Decrypt string
        let data = JSON.parse(_encryptedString);
        return Config.interface.auth.allowedUserIds.includes(data.userId);
    } catch (e) {
        return false;
    }
}

export function InterfaceClient(_conn) {
    const This = this;
    const Conn = _conn;
    this.isInterfaceClient = true;
    console.log('Upgraded client ' + this.id + ' to InterfaceClient');

    this.subscriptions = new SubscriptionList([
        ServiceManager.getService('CableLamp').subscribe({onEvent: handleCableLampEvent}),
        ServiceManager.getService('MovementTracker').subscribe({onEvent: handleMovementEvent})
    ]);

    function handleCableLampEvent(_event) {
        _event.serviceId = 'CableLamp';
        Conn.send(JSON.stringify(_event));
    }
    function handleMovementEvent(_event) {
        _event.serviceId = 'MovementTracker';
        Conn.send(JSON.stringify(_event));
    }

    Conn.on("message", buffer => {
        let message;
        try {
            message = JSON.parse(buffer);
        } catch (e) {return Conn.send(JSON.stringify({error: "Invalid request"}))};

        console.log('interfaceclient request', This.id, message);

        let subscription = This.subscriptions.get(message.serviceId);
        if (!subscription) return Conn.send(JSON.stringify({error: "Subscription not found"}));

        console.log(
            "Subscriber of service " + subscription.service.id + ".handleRequest()", 
            message, 
            subscription.handleRequest(message)
        );
    });
}


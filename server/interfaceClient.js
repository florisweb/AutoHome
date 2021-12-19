import * as crypto from "crypto";
import Config from './config.js';
import ServiceManager from './services/serviceManager.js';
import { SubscriptionList } from './services/serviceLib.js';

const encryptionMethod = 'AES-256-CBC';
const keyIvSplitter = "&iv=";
export function authenticateInterfaceClient(_key) {
    try {
        // Decrypt string
        let encryptedString = _key.split(keyIvSplitter)[0];
        let iv              = _key.split(keyIvSplitter)[1];
        let decryptedString = decrypt(encryptedString, encryptionMethod, Config.interface.auth.signInWithFloriswebKey, iv);
        if (!decryptedString) return false;

        let data = JSON.parse(decryptedString);
        return Config.interface.auth.allowedUserIds.includes(data.userId);
    } catch (e) {
        console.log("error", e);
        return false;
    }
}

var encrypt = function (plain_text, encryptionMethod, secret, iv) {
    var encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
    return encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64');
};

var decrypt = function (encryptedMessage, encryptionMethod, secret, iv) {
    var decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
    return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
};












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

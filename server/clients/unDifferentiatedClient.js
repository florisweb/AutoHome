import * as crypto from "crypto";
import ServiceManager from '../serviceManager.js';
import Config from '../config.js';

import { BaseClient } from './baseClient.js';
import { InterfaceClient } from './interfaceClient.js';
import { DeviceClient } from './deviceClient.js';



export class UnDifferentiatedClient extends BaseClient {
    authenticated = false;

    _onMessage(_buffer) {    
        let data = super._onMessage(_buffer);
        if (!data) return;
        
        // Authentication
        if (!data.id) return this.send({error: "Parameters missing"});

        // InterfaceClient
        if (data.id === "InterfaceClient")
        {
            if (!authenticateInterfaceClient(data.key))
            {
                console.log('[Invalid key] InterfaceClient ' + this.id + " tried to connect with an invalid key.");
                this.send({"type": "auth", "status": false, "error": "Invalid Key"});
                this.conn.close();
                return;
            }
            
            new InterfaceClient(this.conn);
            this.send({"type": "auth", "status": true});
            this.remove();
            return;
        }

        // DeviceClient
        let service = ServiceManager.getService(data.id);
        if (!service) return this.send({error: "Service not found"});
        if (!service.config.isDeviceService) return this.send({error: "Service is not a deviceService"});
        
        let allowed = service.authenticate(data.key);
        if (!allowed) return this.send({error: "Invalid Key"});

        new DeviceClient(this.conn, this.service);
        this.send({type: "auth", data: true});
        this.remove();
    }
}








const encryptionMethod = 'AES-256-CBC';
const keyIvSplitter = "&iv=";
function authenticateInterfaceClient(_key) {
    try {
        // Decrypt string
        let encryptedString = _key.split(keyIvSplitter)[0];
        let iv              = _key.split(keyIvSplitter)[1];
        let decryptedString = decrypt(encryptedString, encryptionMethod, Config.interface.auth.signInWithFloriswebKey, iv);
        if (!decryptedString) return false;

        let data = JSON.parse(decryptedString);
        return Config.interface.auth.allowedUserIds.includes(data.userId);
    } catch (e) {return false;}
}

var encrypt = function (plain_text, encryptionMethod, secret, iv) {
    var encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
    return encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64');
};

var decrypt = function (encryptedMessage, encryptionMethod, secret, iv) {
    var decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
    return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
};
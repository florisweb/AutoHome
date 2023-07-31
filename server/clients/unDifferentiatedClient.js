import Logger from '../logger.js';
import * as crypto from "crypto";
import ServiceManager from '../serviceManager.js';

import { FileManager } from '../DBManager.js';
const Config = await (new FileManager("../config.json")).getContent(); 


import { BaseClient } from './baseClient.js';
import { InterfaceClient } from './interfaceClient.js';
import { DeviceClient } from './deviceClient.js';



export class UnDifferentiatedClient extends BaseClient {
    authenticated = false;

    _onMessage(_buffer) {    
        let message = super._onMessage(_buffer);
        if (!message) return;
        if (!message.isRequestMessage) return this.send({error: "Parameters missing"});
        
        // Authentication
        if (!message.isAuthMessage) return message.respond({error: "Parameters missing"});

        // InterfaceClient
        if (message.id === "InterfaceClient")
        {
            if (!authenticateInterfaceClient(message.key))
            {
                Logger.log('InterfaceClient ' + this.id + " tried to connect with an invalid key.", null, 'CONNECTOR');
                message.respond({"type": "auth", "status": false, "error": "Invalid Key"});
                this.conn.close();
                return;
            }
            
            new InterfaceClient(this.conn);
            message.respond({"type": "auth", "status": true});
            this.remove();
            return;
        }

        // DeviceClient
        let service = ServiceManager.getService(message.id);
        if (!service) return message.respond({error: "Service not found"});
        if (!service.isDeviceService) return message.respond({error: "Service is not a deviceService"});
        
        let allowed = service.authenticate(message.key);
        if (!allowed) return message.respond({error: "Invalid Key"});
        new DeviceClient(this.conn, service);
        message.respond({type: "auth", data: true});
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
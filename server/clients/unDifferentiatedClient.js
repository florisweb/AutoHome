import Logger from '../logger.js';
import ServiceManager from '../serviceManager.js';

import { FileManager } from '../DBManager.js';
const Config = await (new FileManager("../config.json")).getContent(true); 


import { BaseClient } from './baseClient.js';
import { InterfaceClient } from './interfaceClient.js';
import { DeviceClient } from './deviceClient.js';
import UserManager from '../userManager.js';




export class UnDifferentiatedClient extends BaseClient {
    authenticated = false;

    async _onMessage(_buffer) {    
        let message = super._onMessage(_buffer);
        if (!message) return;
        if (!message.isRequestMessage) return this.send({error: "Parameters missing"});
        
        // Authentication
        if (!message.isAuthMessage) return message.respond({error: "Parameters missing"});

        // InterfaceClient
        if (message.id === "InterfaceClient")
        {
            let token = await UserManager.authenticate(message.key);
            if (!token)
            {
                Logger.log('InterfaceClient ' + this.id + " tried to connect with an invalid key.", null, 'CONNECTOR');
                message.respond({"type": "auth", "status": false, "error": "Invalid Token or Key"});
                this.conn.close();
                return;
            }
            
            if (typeof token === 'string')
            {
                message.respond({"type": "auth", "status": true, 'token': token});
            } else message.respond({"type": "auth", "status": true});

            let user = await UserManager.getUser(typeof token === 'string' ? token : message.key);
            console.log('set user', user);
            let client = new InterfaceClient(this.conn, user);
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




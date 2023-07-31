import Logger from '../logger.js';
import ServiceManager from '../serviceManager.js';
import { BaseClient } from './baseClient.js';




export let clients = [];

export class DeviceClient extends BaseClient {
    authenticated = true;
    service;

    constructor(_conn, _service) {
        super(_conn);
        this.service = _service;
        this.service.setDeviceClient(this);
        Logger.log('Bound DeviceClient ' + this.id + " to service " + this.service.id, null, 'CONNECTOR');
    }

    _onMessage(_buffer) {    
        let message = super._onMessage(_buffer);
        if (!message) return;
        this.service.onMessage(message);
    }
    _onClose() {
        super._onClose();
        if (this.service) this.service.setDeviceClient(false);
    }
    _onPong() {
        super._onPong();
        if (this.service) this.service.setDeviceClient(this);
    }
}
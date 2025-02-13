import { Subscriber, SubscriptionList, DeviceService, DeviceServiceState, ServiceFileManager } from '../../../serviceLib.js';
import Logger from '../../../logger.js';

function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    async function handleRequest(_message) {
        return This.service.send(_message);
    }
}

export default class extends DeviceService {
    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
    }
    curState = new DeviceServiceState({
        targetTemp: 0,
        temperature: 0,
        humidity: 0,
    }, this);


    async setup() {
    }


    onMessage(_message) {
        super.onMessage(_message);
        this.pushEvent(_message);
    }
}


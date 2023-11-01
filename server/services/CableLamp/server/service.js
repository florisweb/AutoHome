import { Subscriber, SubscriptionList, DeviceService, ServiceFileManager } from '../../../serviceLib.js';


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

    async setup() {
    }

    onMessage(_message) {
        this.pushEvent(_message);
    }

    async onDeviceConnect() {
        this.send({type: 'setLampState', data: this.curState.lampOn});
        this.send({type: 'setSternIntensity', data: this.curState.sternIntensity});
    }
}







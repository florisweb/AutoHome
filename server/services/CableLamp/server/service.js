import { Subscriber, SubscriptionList, DeviceService, DeviceServiceState } from '../../../serviceLib.js';


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
        lampOn: false,
        sternIntensity: 0,
    });


    async setup() {
    }

    onMessage(_message) {
        switch (_message.type) {
            case 'sternIntensity': 
                this.curState.sternIntensity = _message.data;
            break;
            case 'lampStatus':
                this.curState.lampOn = _message.data;
            break;
        }
        this.pushCurState();
    }

    async onDeviceConnect() {
        this.send({type: 'setLampState', data: this.curState.lampOn});
        this.send({type: 'setSternIntensity', data: this.curState.sternIntensity});
    }
}







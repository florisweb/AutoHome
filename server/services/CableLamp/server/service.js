import { Subscriber, SubscriptionList, DeviceService, DeviceServiceState } from '../../../serviceLib.js';
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
        lampOn: false,
        sternIntensity: 0,
    }, this);


    async setup() {
    }

    onMessage(_message) {
        super.onMessage(_message);
        switch (_message.type) {
            case 'sternIntensity': 
                this.curState.sternIntensity = _message.data;
            break;
            case 'lampStatus':
                this.curState.lampOn = _message.data;
            break;
        }
        this.pushEvent(_message);
    }

    
    setSternIntensity(_intensity) {
        Logger.log(`Set stern intensity to ${_intensity}`, null, 'CABLELAMP');
        this.curState.sternIntensity = _intensity;
        this.curState.pushToDevice();
    }
    animateSternIntensity(_intensity, _duration = 300) {
        Logger.log(`Animate stern intensity to ${_intensity} in ${_duration}ms`, null, 'CABLELAMP');
        this.curState.sternIntensity = _intensity;
        if (this.deviceClient) this.deviceClient.send({type: 'animateSternIntensity', data: [_intensity, _duration]});
    }

    setLampOnState(_lampOn) {
        this.curState.lampOn = _lampOn;
        Logger.log(`Set lampOn to ${_lampOn}`, null, 'CABLELAMP');
        this.curState.pushToDevice();
    }
}







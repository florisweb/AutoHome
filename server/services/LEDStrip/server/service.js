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
    curState = new DeviceServiceState({});


    async setup() {
    }

    onWantedServiceLoad(_Service) {
        if (_Service.id !== 'ShortCutAPI') return console.error(`${this.serviceId}: Error while loading, ShortCutAPI not found`);
        _Service.subscribe({
            acceptorService: this,
            onEvent: async (_data) => {
                console.log('event', _data);
                if (_data.type !== 'phoneCharging') return; // Initialization packet
                this.playChargePhoneAnimation(_data.data);
            }
        });
    }


    onMessage(_message) {
        super.onMessage(_message);
        this.pushCurState();
    }

    async onDeviceConnect() {
    }

    async playChargePhoneAnimation(_percentage = 100) {
        this.send({type: 'playChargePhoneAnimation', data: _percentage});
    }
}


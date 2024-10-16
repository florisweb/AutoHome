import { Subscriber, SubscriptionList, DeviceService, DeviceServiceState } from '../../../serviceLib.js';


function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    async function handleRequest(_message) {
        if (_message.type === 'setBaseColor')
        {
            This.service.curState.baseColor = _message.data;
            This.service.pushCurState();
        } else if (_message.type === 'animateBaseColor')
        {
            This.service.curState.baseColor = [_message.data[0], _message.data[1], _message.data[2]];
            This.service.pushCurState();
        }

        return This.service.send(_message);
    }
}

export default class extends DeviceService {
    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
    }
    curState = new DeviceServiceState({
        baseColor: [0, 0, 0],
        outsideLightLevel: 0,
        insideLightLevel: 0,
    }, this);


    async setup() {
    }

    onWantedServiceLoad(_Service) {
        if (_Service.id !== 'ShortCutAPI') return console.error(`${this.serviceId}: Error while loading, ShortCutAPI not found`);
        _Service.subscribe({
            acceptorService: this,
            onEvent: async (_data) => {
                if (_data.type !== 'phoneCharging') return; // Initialization packet
                this.playChargePhoneAnimation(_data.data);
            }
        });
    }


    onMessage(_message) {
        super.onMessage(_message);
        switch (_message.type)
        {
            case "OutsideLightLevelChangeEvent": 
                this.curState.outsideLightLevel = _message.data;
                return this.pushCurState();
            case "InsideLightLevelChangeEvent": 
                this.curState.insideLightLevel = _message.data;
                return this.pushCurState();
        }
        this.pushEvent(_message);
    }

    async playChargePhoneAnimation(_percentage = 100) {
        this.send({type: 'playChargePhoneAnimation', data: _percentage});
    }


    setBaseColor(_color) {
        this.curState.baseColor = _color;
        this.curState.pushToDevice();
        this.pushCurState();
    }

    animateBaseColor(_color, _duration = 300) {
        this.curState.baseColor = _color;
        this.send({type: 'animateBaseColor', data: [..._color, _duration]});
        this.pushCurState();
    }
}


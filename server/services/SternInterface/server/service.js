import { Subscriber, SubscriptionList, Service, DeviceServiceState } from '../../../serviceLib.js';


function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    async function handleRequest(_message) {
        let CableLamp = This.service.subscriptions.get('CableLamp');
        if (!CableLamp) return;
        CableLamp.handleRequest(_message);
    }
}

export default class extends Service {    
    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
    }
    curState = new DeviceServiceState({
        sternIntensity: 20,
    });



    onLoadRequiredServices(_services) {
        let cableLamp = _services.CableLamp.subscribe({
            onEvent: (_event) => {
                switch (_event.type) 
                {
                    case 'sternIntensity': 
                        this.curState.sternIntensity = _event.data;
                        this.pushEvent(_event);
                    break;
                    case 'curState':
                        this.curState.deviceOnline = _event.data.deviceOnline;
                        this.pushCurState();
                    break;
                }
            }
        });
        this.subscriptions = new SubscriptionList([cableLamp]);
    }
}







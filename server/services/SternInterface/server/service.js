import { Subscriber, SubscriptionList, Service } from '../../../serviceLib.js';


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

    onLoadRequiredServices(_services) {
        let cableLamp = _services.CableLamp.subscribe({
            onEvent: (_event) => {
                if (_event.type !== 'sternIntensity') return;
                this.pushEvent(_event);
            }
        });
        this.subscriptions = new SubscriptionList([cableLamp]);
    }
}







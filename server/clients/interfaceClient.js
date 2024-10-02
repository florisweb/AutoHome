import ServiceManager from '../serviceManager.js';
import { SubscriptionList } from '../serviceLib.js';
import { BaseClient } from './baseClient.js';


export class InterfaceClient extends BaseClient {
    authenticated       = true;
    subscriptions       = [];

    constructor() {
        super(...arguments);

        let UIServices = ServiceManager.getUIServices();
        this.subscriptions = new SubscriptionList(
            UIServices.map(service => service.subscribe({
                onEvent: (_event) => {
                    _event.serviceId = service.id;
                    this.send(_event);
                }
            }))
        );
    }


    async _onMessage(_buffer) {
        let message = super._onMessage(_buffer);
        if (!message) return;

        if (message.serviceId == "serviceManager" && message.isRequestMessage)
        {
            switch (message.type) 
            {
                case "getServiceConditions": 
                    message.respond(await ServiceManager.getServiceConditions());
                    break;
                case "setServiceEnableState":
                    message.respond(await ServiceManager.setServiceEnableState(message.data.serviceId, message.data.enable));
                    break;
            }
            return;
        }

        let subscription = this.subscriptions.get(message.serviceId);
        if (!subscription) return this.send({error: "Subscription not found"});
        subscription.handleRequest(message);
    }
}

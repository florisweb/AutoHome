
import ServiceManager from '../../../serviceManager.js';
import { Subscriber, Service, ServiceState } from '../../../serviceLib.js';


function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

    async function handleRequest(_message) {

        switch (_message.type) 
        {
            case "getServiceConditions": 
                if (!_message.isRequestMessage) return;
                _message.respond(await ServiceManager.getServiceConditions());
                break;
            case "setServiceEnableState":
                if (!_message.isRequestMessage) return;
                _message.respond(await ServiceManager.setServiceEnableState(_message.data.serviceId, _message.data.enable));
                break;
            case "restart":
                ServiceManager.restartServer();
                break;
        }
    }
}


export default class extends Service {
    curState = new ServiceState({
        outdatedServices: []
    }, this);


    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
    }

    setOutDatedServices(_serviceIds) {
        this.curState.outdatedServices = _serviceIds;
        this.pushCurState();
    }
}











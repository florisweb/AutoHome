import { URL } from 'url';

import WebServer from '../../../webServer.js';

import { Subscriber, Service, ServiceFileManager } from '../../../serviceLib.js';


function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    this.acceptorService = _config.acceptorService

    async function handleRequest(_message) {
        console.log('ELumensubscriber.handleRequest', _message);

        // Server intercepted messages
        switch (_message.type)
        {
            case "getData": 
                return This.onEvent({type: "data", data: await This.service.dataManager.getData()});
        }
        // Default messages
        return This.service.send(_message);
    }
}


export default class extends Service {
    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
        WebServer.registerEndPoint('/ShortCutAPI/upload', async (_request, _response) => {
            if (_request.method !== 'POST') return _response.sendStatus(400);
            try {
                let data = JSON.parse(_request.body.data);
                let subscriber = this.subscribers.find((sub) => sub.acceptorService.id === data.serviceId || sub.acceptorService.id === _request.body.serviceId);
                console.log('[ShortCutAPI] Upload data:', !!subscriber, data.serviceId);
                if (!subscriber) return _response.sendStatus(400);
                subscriber.onEvent(data);
            } catch (e) {
                console.log('[ShortCutAPI] Error while uploading data:', e);
                return _response.sendStatus(400);
            }

            _response.sendStatus(200);
        });
    }
}











import { URL } from 'url';

import WebServer from '../../../webServer.js';
import { Subscriber, Service, ServiceFileManager } from '../../../serviceLib.js';





function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

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
    dataManager = new (function(_service) {
        let fm = new ServiceFileManager({path: "data.json", defaultValue: []}, _service);
        this.addDataPoint = async function({lat, long}) {
            let data = await fm.getContent();
            data.push({date: Date.now(), lat: lat, long: long});
            return fm.writeContent(data);
        }
        this.getData = function() {
            return fm.getContent();
        }
    })(this);

    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);

        const root = './services/LocTracker/interface/App/';
        const files = [
            'index.html',
            'js/dataManager.js',
            'js/extraFunctions.js',
            'js/mappa.js',
            'js/p5.min.js',
            'js/script.js',
            'js/topBar.js',
            'css/main.css'
        ];

        WebServer.registerStaticEndPoint('/LocTracker', './services/LocTracker/interface/App/index.html');    
        for (let file of files)
        {
            WebServer.registerStaticEndPoint('/LocTracker/' + file, root + file);
        };

        WebServer.registerEndPoint('/LocTracker/API/data.json', async (_request, _response) => {;
            let data = await this.dataManager.getData();
            _response.send(data);
        });

        WebServer.registerEndPoint('/LocTracker/API/upload', async (_request, _response) => {
            if (_request.method !== 'POST') return _response.sendStatus(400);
            try {
                let data = {
                    lat: parseFloat(_request.body.lat),
                    long: parseFloat(_request.body.long),
                }
                if (isNaN(data.lat) || isNaN(data.long)) return _response.sendStatus(400);
                this.dataManager.addDataPoint(data);
            } catch (e) {
                return _response.sendStatus(400);
            }

            _response.sendStatus(200);
        });
    }

    onMessage(_message) {
        this.pushEvent(_message);
    }
}











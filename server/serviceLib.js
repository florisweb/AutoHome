import ServiceManager from './serviceManager.js';
import Errors from './errors.js';
import { FileManager } from './DBManager.js';
import { ServiceLogger } from './logger.js';



export class ServiceState {
    constructor(_params = {}, _service) {
        for (let key in _params) this[key] = _params[key];
    }
    export() {
        let data = {};
        for (let key in this)
        {
            if (typeof key === 'function') continue;
            data[key] = this[key];
        }

        return data;
    }
}
export class DeviceServiceState extends ServiceState {
    #service;

    deviceOnline = false;
    constructor(_params, _service) {
        super(...arguments);
        this.#service = _service;
    }

    pushToDevice() {
        if (!this.#service || !this.#service.deviceClient) return;
        this.#service.deviceClient.send({type: 'curState', data: this.export()});
    }
}




export class Service {
    id;
    config;
    logger;
    subscribers = [];
    curState = new ServiceState();
    condition = {};


    // Working variables
    #subscriberTemplate;
    enabled = false;
    requiredServices = [];
    wantedServices = [];
    Services = {}; // Will contain the required/wanted services when loaded


    constructor({id, config}, _subscriberTemplate = Subscriber) {
        this.id = id;
        this.#subscriberTemplate = _subscriberTemplate;
        this.config             = config;
        this.requiredServices   = this.config.requires ? this.config.requires : [];
        this.wantedServices     = this.config.wants ? this.config.wants : [];
        this.logger             = new ServiceLogger(this);
    }



    pushEvent(_event) {
        for (let subscriber of this.subscribers) subscriber.onEvent(_event);
    }

    pushCurState(_sub) {
        let event = {type: "curState", data: this.curState.export()};
        if (!_sub) return this.pushEvent(event);
        _sub.onEvent(event);
    }


    subscribe(_subscriber) {
        let sub = new this.#subscriberTemplate(_subscriber);
        sub.service = this;
        this.subscribers.push(sub);
        this.pushCurState(sub);
        return sub;
    }




    // @overwrite
    setup() {}
    enable() {};
    getCondition() {};


    onLoadRequiredServices(services) {}; // Runs when all required services are loaded
    onWantedServiceLoad(service) {}; // Runs every time a wanted service is loaded
}




export class DeviceService extends Service {
    get isDeviceService() {return true};
    #key;
    
    curState = new DeviceServiceState(null, this);
    deviceClient = false;
    downTimeTracker = new Service_downTimeTracker(this);


    constructor()
    {
        super(...arguments);
        this.#key = this.config.key;
    }


    authenticate = (_key) => {
        if (this.#key === undefined) return true;
        return this.#key === _key;
    }

    setDeviceClient = (_deviceClient) => {
        let isNewClient = this.deviceClient ? _deviceClient.id != this.deviceClient.id : true;
        this.deviceClient = _deviceClient;
        this.curState.deviceOnline = !!this.deviceClient;

        if (!isNewClient) return;
        this.downTimeTracker.updateConnectionState(!!this.deviceClient);
        this.pushCurState();
        
        if (this.deviceClient) 
        {
            this.deviceClient.send({type: 'curState', data: this.curState});
            return this.onDeviceConnect();
        }
        this.onDeviceDisconnect();
    }


    send(_message) {
        if (!this.deviceClient) return Errors.NotConnectedService;
        this.deviceClient.send(_message);
    }


    // @Overwrite
    getCondition = () => this.deviceClient ? 'online' : 'offline';
    onDeviceConnect() {}
    onDeviceDisconnect() {};
    onMessage(_message) {
        return _message;
    }
}












export function ServiceFileManager({path, defaultValue = {}}, _service) {
    let fm = new FileManager(_service.id + "_" + path);
    this.getContent = (_isJSON) => {
        return new Promise((resolve) => {
            fm.getContent(_isJSON).then((_result) => {
                if (typeof _result != 'object' || _result instanceof Buffer) return resolve(defaultValue);
                resolve(_result);
            }, () => resolve(defaultValue));
        });
    }
    this.writeContent = function() {
        return new Promise((resolve) => {
            fm.writeContent(...arguments).then(
                (_result) => {resolve(_result)}, 
                () => {resolve(false)}
            );
        })
        
    };
}







function Service_downTimeTracker(_parent) {
    let fm = new ServiceFileManager({path: "downTime.json", defaultValue: []}, _parent);
    this.getData = function() {return fm.getContent(...arguments)};

    this.updateConnectionState = async function(_connected) {
        let data = await this.getData();
        let curDateTime = new Date();
        curDateTime.setHours(0);
        curDateTime.setMinutes(0);
        curDateTime.setSeconds(0);
        const minTime = curDateTime.getTime() - 1000 * 60 * 60 * 24 * 6; // 7 days
        // Filter the data so it will only be one week old
        for (let i = data.length - 1; i >= 0; i--)
        {
            if (data[i][0] > minTime) continue;
            
            if (data[i].length == 2 && data[i][1] < minTime)
            {
                data.splice(i, 1);
            } else data[i][0] = minTime;
        }




        let lastSet = data[data.length - 1];
        if (!lastSet) // Data init
        {
            if (!_connected) return;
            data[0] = [Date.now()];
            return fm.writeContent(data);
        }

        if (_connected)
        {
            if (lastSet.length == 1) return;
            let newSet = [Date.now()]
            data.push(newSet);
            return fm.writeContent(data);
        }

        if (lastSet.length != 1) return;
        data[data.length - 1][1] = Date.now();
        return fm.writeContent(data);
    }
}
















export function SubscriptionList(_list = []) {
    _list.get = (_id) => {
        return _list.find((sub) => {return sub.service.id == _id});
    }
    return _list;
}




export function Subscriber({onEvent, handleRequest = () => {}}) {
    this.service = false;
    this.onEvent = (_data) => {return onEvent(_data)}; // Given by client

    this.handleRequest = async(_message) => { // Given by service
        switch (_message.type)
        {
            case "getDownTime":
                if (!this.service.isDeviceService) return _message.respond("E_notDeviceService");
                let data = await this.service.downTimeTracker.getData();
                return _message.respond(data);
            default: 
                try {
                    return handleRequest(_message);
                } catch (e) {console.log(this.service.id, "subscriber had an error", e)};
        }
    }
}










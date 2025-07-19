
import { Subscriber, Service, ServiceState, ServiceFileManager } from '../../../serviceLib.js';



function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

    async function handleRequest(_message) {
        if (!_message.isRequestMessage) return;
        switch (_message.type)
        {
            case "getPlants": 
                return _message.respond({
                    type: 'plants',
                    data: This.service.exportPlantlList()
                });
            case "getMoistureData": 
                let plant = This.service.getPlantById(_message.data.id);
                if (!plant) return _message.respond({
                    type: 'moistureData',
                    error: "E_plantNotFound"
                });

                return _message.respond({
                    type: 'moistureData',
                    data: await plant.getMoistureData(),
                });
        }
    }
}


export default class extends Service {
    dataManager = new (function(_service) {
        let fm = new ServiceFileManager({path: "config.json", defaultValue: []}, _service);
        // this.addDataRow = async function(_data) {
        //     let data = await fm.getContent(true);
        //     data.push({time: Date.now(), data: _data});
        //     return fm.writeContent(data);
        // }
        this.getData = function() {
            return fm.getContent(true);
        }
    })(this);

    curState = new (class extends ServiceState {
        #service;
        constructor(_service) {
            super();
            this.#service = _service;
        }

        export() {
            let data = super.export();
            data.plants = this.#service.exportPlantlList();
            return data;
        }
    })(this)
    

    #plants = [];
    get plants() {
        return this.#plants;  
    }

    exportPlantlList() {
        return this.#plants.map(r => {return {
            ...r, 
            id: r.id,
            ownerService: r.ownerService.id,
        }});
    }
    getPlantById(_id) {
        return this.#plants.find(p => p.id === _id);
    }

    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
    }

    onMessage(_message) { 
        this.pushEvent(_message);
    }


    // API
    async registerPlant(_config = {plantId: 0, moistureGetter: () => {}}, _service) {
        this.#plants.push(new Plant({
            ..._config,
            ownerService: _service
        }, this));
    }
}


class Plant {
    get id() {
        return this.plantId + '/' + this.ownerService.id;
    }

    ownerService;
    plantId;
    #moistureGetter;
    constructor({plantId, moistureGetter, ownerService}, _service) {
        this.plantId = plantId;
        this.ownerService = ownerService;
        this.#moistureGetter = moistureGetter;
    }

    async getMoistureData() {
        return await this.#moistureGetter();
    }
}









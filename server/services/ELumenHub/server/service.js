
import { Subscriber, DeviceService, ServiceFileManager } from '../../../serviceLib.js';


// function CustomSubscriber(_config) {
//     const This = this;
//     Subscriber.call(this, {..._config, handleRequest: handleRequest});

//     async function handleRequest(_message) {
//         console.log('ELumensubscriber.handleRequest', _message);

//         // Server intercepted messages
//         switch (_message.type)
//         {
//             case "getData": 
//                 return This.onEvent({type: "data", data: await This.service.dataManager.getData()});
//         }
//         // Default messages
//         return This.service.send(_message);
//     }
// }


export default class extends DeviceService {
    waterTracker = new pushableDataManager("water.json", this);
    moistureTracker = new pushableDataManager("moisture.json", this);

    constructor({id, config}) {
        super(arguments[0]);
    }

    onMessage(_message) {
        switch (_message.type)
        {
            case "sensorState": this.moistureTracker.addDataRow(_message.data); break;
            case "waterState": this.waterTracker.addDataRow([
                _message.data.stockPerc,
                ..._message.data.addedWaterVolumes
            ]); break;
        }
        
        this.pushEvent(_message);
    }

    onLoadRequiredServices({ELumenManager}) {
        ELumenManager.registerPlant({plantId: 0, moistureGetter: () => this.#getMoistureDataForPlant(0)}, this);
        ELumenManager.registerPlant({plantId: 1, moistureGetter: () => this.#getMoistureDataForPlant(1)}, this);
        ELumenManager.registerPlant({plantId: 2, moistureGetter: () => this.#getMoistureDataForPlant(2)}, this);
        ELumenManager.registerPlant({plantId: 3, moistureGetter: () => this.#getMoistureDataForPlant(3)}, this);
    }

    async #getMoistureDataForPlant(_index) {
        let data = await this.moistureTracker.getData();
        return data.map(p => {return {time: p.time, value: p.data[_index]}});
    }
}

class pushableDataManager extends ServiceFileManager {
    constructor(_fileName, _service) {
        super({path: _fileName, defaultValue: []}, _service)
    }
    async addDataRow(_data) {
        let data = await this.getContent(true);
        data.push({time: Date.now(), data: _data});
        return this.writeContent(data);
    }
    getData() {
        return this.getContent(true);
    }
}

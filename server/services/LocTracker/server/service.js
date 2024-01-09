
import { Subscriber, DeviceService, ServiceFileManager } from '../../../serviceLib.js';


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


export default class extends DeviceService {
    // dataManager = new (function(_service) {
    //     let fm = new ServiceFileManager({path: "data.json", defaultValue: []}, _service);
    //     this.addDataRow = async function(_data) {
    //         let data = await fm.getContent();
    //         data.push({time: Date.now(), data: _data});
    //         return fm.writeContent(data);
    //     }
    //     this.getData = function() {
    //         return fm.getContent();
    //     }
    // })(this);

    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
    }

    onMessage(_message) {
        this.pushEvent(_message);
    }
}











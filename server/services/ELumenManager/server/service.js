
import { Service, ServiceFileManager } from '../../../serviceLib.js';


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

    constructor({id, config}) {
        super(arguments[0]);
    }

    onMessage(_message) {
      
        this.pushEvent(_message);
    }
}











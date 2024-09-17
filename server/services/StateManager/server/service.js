import { Service } from '../../../serviceLib.js';

export default class extends Service {
    constructor({id, config}) {
        super(arguments[0]);
    }


    onLoadRequiredServices({ShortCutAPI}) {
        if (!ShortCutAPI) return console.error(`${this.serviceId}: Error while loading, ShortCutAPI not found`);
        ShortCutAPI.subscribe({
            acceptorService: this,
            onEvent: async (_data) => {
                switch (_data.type) 
                {
                    case "onWindDownStart":
                        break;
                    case "onBedTimeStart":
                        break;
                    case "onWakeUp":
                        break;
                }
            }
        })
    }
}











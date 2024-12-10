import { Service, ServiceState } from '../../../serviceLib.js';

import Logger from '../../../logger.js';
export default class extends Service {
    curState = new ServiceState({
        curFocus: '',
    });

    onLoadRequiredServices({ShortCutAPI}) {
        ShortCutAPI?.subscribe({
            acceptorService: this,
            onEvent: async (_event) => {
                switch (_event.type) 
                {
                    case "onWindDownStart":
                    case "onBedTimeStart":
                    case "onWakeUp":
                        this.pushEvent({type: _event.type, data: _event.data});
                        break;
                    case "setFocus":
                        this.curState.curFocus = _event.data;
                        this.pushCurState();
                        break;
                }
                Logger.log(`Focus changed to ${this.curState.curFocus || 'none'}`, null, "STATEMANAGER");
            }
        });
    }
}






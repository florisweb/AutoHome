import { Service, ServiceState } from '../../../serviceLib.js';
import { FileManager } from '../../../DBManager.js';
import { importAutomations } from './automationLib.js';

import Logger from '../../../logger.js';
let ConfigFileManager = new FileManager("../config.json");
const Config = await ConfigFileManager.getContent(true);

export default class extends Service {
    #Services = {};
    curState = new ServiceState({
        curFocus: '',
    });

    constructor({id, config}) {
        super(arguments[0]);
        this.#Services.StateManager = this;
    }

    async setup() {
        this.automations = await importAutomations();
        Logger.log(`Loaded ${Object.keys(this.automations).length} automations.`, Object.keys(this.automations), 'AUTOMATOR');
    }


    onLoadRequiredServices({ShortCutAPI}) {
        Object.assign(this.#Services, arguments[0]);
        for (let id in this.#Services) this.#subscribeToService(this.#Services[id]);

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
                Logger.log(`Focus change to ${this.curState.curFocus}`, "FOCUS");
            }
        });
    }

    onWantedServiceLoad(_service) {
        this.#Services[_service.id] = _service;
        this.#subscribeToService(_service);
    }

    #subscribeToService(_service) {
        if (_service.id === 'ShortCutAPI') return; // ShortCutAPI does not provide events for automations, instead they are captured by the statemanager.
        _service.subscribe({
            onEvent: async (_event) => {
                for (let id in this.automations)
                {
                    let curAutomation = this.automations[id];
                    try {
                        curAutomation.handleEvent(_event, _service, this.#Services);
                    } catch (e) {
                        Logger.log(`Error while executing event ${curAutomation.name}: `, e + '', "AUTOMATOR");
                    }
                }
            }
        })
    }
}






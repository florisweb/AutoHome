import { Service, ServiceState } from '../../../serviceLib.js';
import { importAutomations } from './automationLib.js';

import Logger from '../../../logger.js';

export default class extends Service {
    #Services = {};

    constructor({id, config}) {
        super(arguments[0]);
    }

    async setup() {
        this.automations = await importAutomations();
        Logger.log(`Loaded ${Object.keys(this.automations).length} automations.`, Object.keys(this.automations), 'AUTOMATOR');
    }


    onLoadRequiredServices({ShortCutAPI}) {
        Object.assign(this.#Services, arguments[0]);
        for (let id in this.#Services) this.#subscribeToService(this.#Services[id]);
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






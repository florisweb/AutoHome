import { readdirSync } from 'fs'
import { FileManager, getCurDir } from '../../../DBManager.js';
import Logger from '../../../logger.js';

const __dirname = getCurDir();
const ServiceId = 'Automator';
const AutomationPath = __dirname + `/services/${ServiceId}/server/automations`;



export async function importAutomations() {
    let paths = readdirSync(AutomationPath, { withFileTypes: true })
            .filter(dirent => !dirent.isDirectory() && !dirent.name.includes(".DS_Store"))
            .map(dirent => dirent.name);

    let Automations = {};
    for (let path of paths)
    {
        await import(AutomationPath + '/' + path).then((mod) => {
            let id = path.substr(0, path.length - 3); // Remove the .js-extension
            Automations[id] = new mod.default();
            Automations[id].id = id;
        });
    }
    return Automations;
}








export class Automation {
    triggers = [];
    Config = {};
    requiredServices = [];
    name;
    Services = {};

    constructor({name, triggers, requiredServices}, _config = {}) {
        this.name = name;
        this.requiredServices = requiredServices;
        this.triggers = triggers;
        this.Config = _config;
    }

    handleEvent(_event, _service, _services) {
        this.Services = _services;
        for (let serviceId of this.requiredServices) 
        {
            if (!_services[serviceId]) return; // Logger.log(`Error: Automation ${this.name} couldn't handle event as required service ${serviceId} was not loaded (yet).`, null, "AUTOMATOR");
        }

        for (let trigger of this.triggers)
        {
            if (trigger.service !== _service.id) continue;
            if (trigger.event && trigger.event !== '*' && trigger.event !== _event.type) continue;
            if (trigger.value && trigger.value !== '*' && trigger.value !== _event.data) continue;
            this.onTrigger(_event, _service, _services);
        }
    }

    onTrigger(_service, _event, _services) {}
}

export function wait(_dt) {
    return new Promise((resolve) => {
        setTimeout(resolve, _dt);
    })
}
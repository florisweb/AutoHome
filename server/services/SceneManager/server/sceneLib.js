import { readdirSync } from 'fs'
import { FileManager, getCurDir } from '../../../DBManager.js';
import Logger from '../../../logger.js';

const __dirname = getCurDir();
const ServiceId = 'SceneManager';
const ScenePath = __dirname + `/services/${ServiceId}/server/scenes`;

export class Scene {
    name;
    id;
    hiddenInUI = false;
    enabled = false;
    disabled = false;
    #requiredServices = [];
    Services = {};
    config = {};

    constructor({name, requiredServices, hiddenInUI, disabled}, _config) {
        this.name = name;
        this.#requiredServices = requiredServices;
        this.config = _config;
        this.disabled = !!disabled;
        this.hiddenInUI = hiddenInUI;
    }

    activate() {
        if (!this.enabled || this.disabled) return false;
        try {
            this.onActivate(...arguments);
        } catch (e) {
            Logger.log(`Error while activating scene '${this.name}': ` + e, null, 'SceneManager');
        }
        return true;
    }

    enable(_services) {
        if (this.disabled) return;
        this.Services = _services;
        for (let reqService of this.#requiredServices)
        {
            if (!this.Services[reqService]) return `Missing service ${reqService}`;
        }
        this.enabled = true;
    }
    
    // Overwrite
    isActive() {
        return false;
    }
    
    onActivate() {}
}




export class JSONScene extends Scene {
    stateDescription = [];
    constructor(_JSON) {
        let requiredServices = [];
        for (let state of _JSON.state)
        {
            let serviceId = state[0].split('.')[0];
            if (requiredServices.includes(serviceId)) continue;
            requiredServices.push(serviceId);
        }

        super({
            ..._JSON,
            requiredServices: requiredServices
        });
        this.stateDescription = _JSON.state;
    }

    isActive() {
        for (let state of this.stateDescription)
        {
            let [serviceId, stateKey] = state[0].split('.');
            let targetValue = state[1];
            if (targetValue instanceof Array)
            {
                if (!arrayEquals(this.Services[serviceId].curState[stateKey], targetValue)) return false;
            } else {
                if (this.Services[serviceId].curState[stateKey] !== targetValue) return false;
            }
        }
        return true;
    }

    onActivate() {
        for (let state of this.stateDescription)
        {
            let [serviceId, stateKey] = state[0].split('.');
            let targetValue = state[1];

            let customs = state[2];
            if (customs?.setFunc)
            {
                if (typeof customs.extraParams !== 'undefined')
                {
                    this.Services[serviceId][customs.setFunc](targetValue, ...customs.extraParams);
                } else this.Services[serviceId][customs.setFunc](targetValue);
            } else { 
                this.Services[serviceId].curState[stateKey] = targetValue;   
                if (this.Services[serviceId].isDeviceService) this.Services[serviceId].curState.pushToDevice();
            }
        }
    }
}






export class DynamicScene extends Scene {
    isDynamicScene = true;
    running = false;
    constructor() {
        super(...arguments);
    }


    activate() {
        if (!super.activate(...arguments)) return;
        this.running = true;
    }

    handleEvent(_event) {
        if (!this.running) return;
        this.onEvent(_event);
    }

    isActive() {
        return this.running;
    }


    // Overwrite
    onEvent(_event) {}
}



export async function importScenes() {
    let scenePaths = readdirSync(ScenePath, { withFileTypes: true })
            .filter(dirent => !dirent.isDirectory() && !dirent.name.includes(".DS_Store"))
            .map(dirent => dirent.name);

    let Scenes = {};
    let promises = [];
    for (let scenePath of scenePaths)
    {
        if (scenePath.includes('.json'))
        {   
            let sceneId = scenePath.substr(0, scenePath.length - 5); // Remove the .js-extension
            let fm = new FileManager('../services/SceneManager/server/scenes/' + scenePath);
            promises.push(fm.getContent(true).then((_JSONContent) => {
                if (typeof _JSONContent?.state !== 'object') return Logger.log(`Error in JSON syntax of scene ${sceneId}`, null, 'SCENEMANAGER');
                Scenes[sceneId] = new JSONScene(_JSONContent);
                Scenes[sceneId].id = sceneId;
            }, (_e) => {
                Logger.log(`Error found in JSONScene ${sceneId}:`, _e, 'SCENEMANAGER');
            }));
            
            continue;
        } 

        promises.push(import(ScenePath + '/' + scenePath).then((mod) => {
            let sceneId = scenePath.substr(0, scenePath.length - 3); // Remove the .js-extension
            Scenes[sceneId] = new mod.default();
            Scenes[sceneId].id = sceneId;
        }));
    }

    await Promise.all(promises);
    return Scenes;
}










// MISC

export function arrayEquals(_a, _b) {
    if (!_a || !_b || typeof _a !== 'object' || typeof _b !== 'object' || _a.length !== _b.length) return false;
    for (let i = 0; i < _a.length; i++)
    {
        if (_a[i] !== _b[i]) return false;
    }
    return true;
}
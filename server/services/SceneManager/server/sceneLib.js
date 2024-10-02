import { readdirSync } from 'fs'
import { FileManager, getCurDir } from '../../../DBManager.js';
const __dirname = getCurDir();
const ServiceId = 'SceneManager';
const ScenePath = __dirname + `/services/${ServiceId}/server/scenes`;

export class Scene {
    name;
    id;
    enabled = false;
    #requiredServices = [];
    Services = {};

    constructor({name, requiredServices}) {
        this.name = name;
        this.#requiredServices = requiredServices;
    }

    activate() {
        if (!this.enabled) return;
        this.onActivate();
    }

    enable(_services) {
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



export async function importScenes() {
    let scenePaths = readdirSync(ScenePath, { withFileTypes: true })
            .filter(dirent => !dirent.isDirectory())
            .map(dirent => dirent.name);

    let Scenes = {};
    for (let scenePath of scenePaths)
    {
        await import(ScenePath + '/' + scenePath).then((mod) => {
            let sceneId = scenePath.substr(0, scenePath.length - 3); // Remove the .js-extension
            Scenes[sceneId] = new mod.default();
            Scenes[sceneId].id = sceneId;
        });
    }
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
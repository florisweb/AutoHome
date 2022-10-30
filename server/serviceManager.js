import { readdirSync } from 'fs'
import { FileManager } from './DBManager.js';

let ConfigFileManager = new FileManager("../config.json");
const Config = await ConfigFileManager.getContent();
let Services = [];



export default new class {
    getService(_id) {
        return Services.find((s) => s.id == _id);
    }

    getUIServices() {
        return Services.filter(_service => _service.config.hasUI);
    }


    getServiceConditions() {
        // let conditions = {};
        // for (let serviceId in this.config.services)
        // {
        //     let service = this.getService(serviceId);
        //     let condition = "unknown";
        //     if (this.config.services[serviceId].disabled) condition = "disabled";
        //     if (service && service.enabled) condition = "enabled";
            
        //     conditions[serviceId] = {
        //         condition: condition,
        //         customCondition: service && service.getCondition() ? service.getCondition() : false 
        //     }
        // }
        // return conditions;
    }

    async #getInstalledServiceIdList() {
        return readdirSync('./services', { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
    }







    async loadServices() {
        let enabledServiceIds = Config.server.enabledServices;
        let installedServiceIds = await this.#getInstalledServiceIdList();
        console.log('[ServiceManager]: Found ' + installedServiceIds.length + ' installed services.');

        let promises = [];
        for (let id of enabledServiceIds)
        {
            if (!installedServiceIds.includes(id))
            {
                console.log('[ServiceManager]: Error: Service ' + id + ' could not be found.');
                continue;
            }

            promises.push(this.#loadService(id));
        }

        await Promise.all(promises);
        
        let setupPromises = []
        for (let service of Services) setupPromises.push(service.setup());
        await Promise.all(setupPromises);


        // Enable all services
        for (let service of Services) await this.#enableService(service);
        console.log("[ServiceManager]: Succesfully loaded " + Services.length + "/" + enabledServiceIds.length + " enabled services and " + Services.length + '/' + installedServiceIds.length + ' installed services.');
    }


    async #loadService(_serviceId) {
        let FM = new FileManager("../services/" + _serviceId + "/config.json");
        if (!(await FM.fileExists())) return console.log('[ServiceManager]: Error: ' + _serviceId + '\'s config.json-file was not found.');
        let serviceConfig = await FM.getContent();

        let FMJS = new FileManager("../services/" + _serviceId + "/server/service.js");
        if (!(await FM.fileExists())) return console.log('[ServiceManager]: Error: ' + _serviceId + '\'s service.js-file was not found.');

        await import('./services/' + _serviceId + '/server/service.js').then((mod) => {
            Services.push(new mod.default({id: _serviceId, config: serviceConfig}, serviceConfig));
        });
    }




  

    async #enableService(_service, _curDepth = 0) {
        if (_service.enabled) return;
        if (_curDepth > 100) return console.log('[ServiceManager] ERROR Invalid require-order: stackoverflow');

        for (let requiredServiceId of _service.requiredServices)
        {
            let curService = this.getService(requiredServiceId);
            if (curService.enabled) continue;
            await this.#enableService(curService, _curDepth + 1);
        }


        let requiredServices = {};
        for (let serviceId of _service.requiredServices)
        {
            let service = this.getService(serviceId);
            if (!service.enabled) return;
            requiredServices[serviceId] = service;
        }

        _service.onLoadRequiredServices(requiredServices);
        _service.enabled = true;
        
        console.log("[ServiceManager] Enabled " + _service.id);
        await _service.enable();
        this.#resolveOnWantedServiceLoad(_service);
    }

    async #resolveOnWantedServiceLoad(_service) {
        for (let service of Services)
        {
            if (!service.wantedServices.includes(_service.id)) continue;
            console.log("[ServiceManager] Loaded wanted service " + _service.id + " of " + service.id + ".");
            service.onWantedServiceLoad(service);
        }
    }



    constructor() {this.loadServices();}
}
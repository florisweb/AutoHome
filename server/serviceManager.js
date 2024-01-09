import Logger from './logger.js';
import { readdirSync } from 'fs'
import { FileManager, getCurDir } from './DBManager.js';
const __dirname = getCurDir();

let ConfigFileManager = new FileManager("../config.json");
const Config = await ConfigFileManager.getContent(true);
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
        return readdirSync(__dirname + '/services', { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
    }







    async loadServices() {
        let enabledServiceIds = Config.server.enabledServices;
        let installedServiceIds = await this.#getInstalledServiceIdList();
        Logger.log('Found ' + installedServiceIds.length + ' installed services.', null, 'SERVICES');

        let promises = [];
        for (let id of enabledServiceIds)
        {
            if (!installedServiceIds.includes(id))
            {
                Logger.log('Error: Service ' + id + ' could not be found.', null, 'SERVICES');
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
        Logger.log("Succesfully loaded " + Services.length + "/" + enabledServiceIds.length + " enabled services and " + Services.length + '/' + installedServiceIds.length + ' installed services.', null, 'SERVICES');
    }


    async #loadService(_serviceId) {
        let FM = new FileManager("../services/" + _serviceId + "/config.json");
        if (!(await FM.fileExists())) return Logger.log('Error: ' + _serviceId + '\'s config.json-file was not found.', null, 'SERVICES');
        let serviceConfig = await FM.getContent(true);

        let FMJS = new FileManager("../services/" + _serviceId + "/server/service.js");
        if (!(await FM.fileExists())) return Logger.log('Error: ' + _serviceId + '\'s service.js-file was not found.', null, 'SERVICES');

        await import('./services/' + _serviceId + '/server/service.js').then((mod) => {
            Services.push(new mod.default({id: _serviceId, config: serviceConfig}, serviceConfig));
        });
    }




  

    async #enableService(_service, _curDepth = 0) {
        if (_service.enabled) return;
        if (_curDepth > 100) return Logger.log('Error: Invalid require-order: stackoverflow', null, 'SERVICES');

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
        
        Logger.log("Enabled " + _service.id, null, 'SERVICES');
        await _service.enable();
        this.#resolveOnWantedServiceLoad(_service);
    }

    async #resolveOnWantedServiceLoad(_service) {
        for (let service of Services)
        {
            if (!service.wantedServices.includes(_service.id)) continue;
            Logger.log("Loaded wanted service " + _service.id + " of " + service.id + ".", null, 'SERVICES');
            service.onWantedServiceLoad(service);
        }
    }



    constructor() {this.loadServices();}
}
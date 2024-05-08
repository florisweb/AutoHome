import child_process from 'child_process';
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


    async setServiceEnableState(_serviceId, _enable) {
        let installedServices = await this.#getInstalledServiceIdList();
        if (!installedServices.includes(_serviceId) && _enable) return 'E_serviceNotInstalled';
        if (!_enable)
        {
            let index = Config.server.enabledServices.findIndex((serviceId) => serviceId === _serviceId);
            if (index === -1) return 'E_serviceAlreadyDisabled';
            Config.server.enabledServices.splice(index, 1);
        } else Config.server.enabledServices.push(_serviceId);
        await ConfigFileManager.writeContent(Config);
        this.#restartServer();
        return "Restarting";
    }

    #restartServer() {
        console.log("Restarting... PID: " + process.pid);
        setTimeout(function () {
            process.on("exit", function () {
                child_process.spawn(process.argv.shift(), process.argv, {
                    cwd: process.cwd(),
                    detached: true,
                    stdio: "inherit"
                });
            });
            process.exit();
        }, 5000);
    }

    async getServiceConditions() {
        let enabledServiceIds = Config.server.enabledServices;
        let installedServiceIds = await this.#getInstalledServiceIdList();
        
        let conditions = {};
        for (let id of installedServiceIds)
        {
            conditions[id] = {state: 'Installed', error: false}
            // Check for install-issues
            // TODO: create a system that automatically rebuilds when the config has changed
        }

        for (let id of enabledServiceIds)
        {
            if (!conditions[id]) conditions[id] = {state: '', error: 'enabledServiceNotInstalled'}
            conditions[id].state = 'EnabledInConfig';
            conditions[id].enabled = true;
        }

        for (let service of Services)
        {
            conditions[service.id].state = 'NotLoaded';
            if (service.enabled) conditions[service.id].state = "Loaded";
            conditions[service.id].hasUI = service.config.hasUI;
            conditions[service.id].isDeviceService = service.isDeviceService;
            conditions[service.id].isSystemService = service.config.isSystemService;
            if (service.condition.loadError) conditions[service.id].error = service.condition.loadError;
        }

        return conditions;
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
            if (!curService) {
                _service.condition.loadError = `Required service not found: ${requiredServiceId}`;
                return Logger.log(`Error: Required service not found (${requiredServiceId} on ${_service.id})`, null, 'SERVICES');
            }
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



    constructor() {this.loadServices()}
}
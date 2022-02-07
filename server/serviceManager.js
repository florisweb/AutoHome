import { FileManager } from './DBManager.js';
let Services = [];

export default new function() {
    const This = this;
    let fm = new FileManager("../serviceConfig.json");
    this.config;
    this.loadConfig = async function() {
        this.config = await fm.getContent();
    }

    this.loadServices = async function() {
        await this.loadConfig();

        let promises = [];
        for (let id in this.config.services)
        {
            if (this.config.services[id].disabled) continue;
            promises.push(import('./services/' + id + '.js').then((mod) => {
                Services.push(new mod.default);
            }));
        }
        await Promise.all(promises);
        
        let setupPromises = []
        for (let service of Services) setupPromises.push(service.setup());
        await Promise.all(setupPromises);


        // Enable all services
        for (let service of Services) await enableService(service);
        console.log("[ServiceManager] Loaded " + Services.length + "/" + Object.keys(this.config.services).length + " services.");
    }

    this.loadServices();
    this.getService = function(_id) {
        return Services.find((s) => s.id == _id);
    }

    this.getUIServices = function() {
        return Services.filter(_service => _service.config.hasUI);
    }

    async function enableService(_service, _curDepth = 0) {
        if (_service.enabled) return;
        if (_curDepth > 100) return console.log('[ServiceManager] ERROR Invalid require-order: stackoverflow');

        for (let requiredServiceId of _service.requiredServices)
        {
            let curService = This.getService(requiredServiceId);
            if (curService.enabled) continue;
            await enableService(curService, _curDepth + 1);
        }


        let requiredServices = {};
        for (let serviceId of _service.requiredServices)
        {
            let service = This.getService(serviceId);
            if (!service.enabled) return;
            requiredServices[serviceId] = service;
        }

        _service.onLoadRequiredServices(requiredServices);
        _service.enabled = true;
        
        console.log("[ServiceManager] Enabled " + _service.id);
        await _service.enable();
        resolveOnWantedServiceLoad(_service);
    }

    async function resolveOnWantedServiceLoad(_service) {
        for (let service of Services)
        {
            if (!service.wantedServices.includes(_service.id)) continue;
            console.log("[ServiceManager] Loaded wanted service " + _service.id + " of " + service.id + ".");
            service.onWantedServiceLoad(service);
        }
    }
}




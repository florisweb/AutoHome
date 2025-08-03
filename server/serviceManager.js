
import { fork } from 'node:child_process';
import { readdirSync } from 'fs'
import { getCurDir } from './polyfill.js';
import { FileManager } from './DBManager.js';

const __dirname = getCurDir();
const Logger = console;

let ConfigFileManager = new FileManager("config.json");
const Config = await ConfigFileManager.getContent(true);


let Services = [];
export default new class {
    async #getInstalledServiceIdList() {
        return readdirSync(__dirname + '/services', { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
    }

    getService(_id) {
    	return Services.find(r => r.id === _id);
    }


    async loadServices() {
    	let installedServiceIds = await this.#getInstalledServiceIdList();
        let enabledServiceIds = Config.server.enabledServices;

       	await this.#loadServices();
        await this.#setupServices();
        let success = await this.#enableServices();
        
        if (!success) return false;
        Logger.log("Succesfully loaded " + Services.length + "/" + enabledServiceIds.length + " enabled services and " + Services.length + '/' + installedServiceIds.length + ' installed services.', null, 'SERVICES');
        return true;
    }

    async #loadServices() {
    	let installedServiceIds = await this.#getInstalledServiceIdList();
        let enabledServiceIds = Config.server.enabledServices;

        Logger.log('Found ' + installedServiceIds.length + ' installed services.', null, 'SERVICES');

        let promises = [];
        for (let id of enabledServiceIds)
        {
            if (!installedServiceIds.includes(id))
            {
                Logger.log('Warning: Service ' + id + ' not installed: skipping.', null, 'SERVICES');
                continue;
            }

            promises.push(this.#loadService(id).then(s => Services.push(s)));
        }

        return await Promise.all(promises);
    }
    async #setupServices() {
    	return Promise.all(Services.map(s => s.setup()));
    }

    async #enableServices() {
    	for (let service of Services) {
        	let success = await this.#enableService(service);
        	if (!success)
        	{
        		Logger.log(`Error: Failed to load service ${service.id}, check the configuration. Stopping.`, null, 'SERVICES');
        		return false;
        	} else {
        		Logger.log(`Succesfully enabled service ${service.id}`, null, 'SERVICES');
        	}
        }
        return true;
    }



    async #loadService(_serviceId) {
        let FM = new FileManager("services/" + _serviceId + "/config.json");
        if (!(await FM.fileExists())) return Logger.log('Error: ' + _serviceId + '\'s config.json-file was not found.', null, 'SERVICES');
        let serviceConfig = await FM.getContent(true);

        let FMJS = new FileManager("../services/" + _serviceId + "/server/service.js");
        if (!(await FM.fileExists())) return Logger.log('Error: ' + _serviceId + '\'s service.js-file was not found.', null, 'SERVICES');
		return new ServiceInterface(_serviceId, serviceConfig);
    }


    async #enableService(_service, _curDepth = 0) {
        if (_service.enabled) return;
        if (_curDepth > 100) return Logger.log('Error: Invalid require-order: stackoverflow', null, 'SERVICES');

        for (let requiredServiceId of _service.requiredServiceIds)
        {
            let curService = this.getService(requiredServiceId);
            if (!curService) {
                _service.condition.loadError = `Required service not found: ${requiredServiceId}`;
                return Logger.log(`Error: Required service not found (${requiredServiceId} on ${_service.id})`, null, 'SERVICES');
            }
            if (curService.enabled) continue;
            let success = await this.#enableService(curService, _curDepth + 1);
            if (!success) return false;
        }


        let requiredServices = {};
        for (let serviceId of _service.requiredServiceIds)
        {
            let service = this.getService(serviceId);
            if (!service.enabled) return;
            requiredServices[serviceId] = service;
        }

        _service.Services = {..._service.Services, ...requiredServices};
        _service.onLoadRequiredServices(requiredServices);
        _service.enabled = true;
        
        await _service.onEnable();
        this.#resolveOnWantedServiceLoad(_service);
        return true;
    }

    async #resolveOnWantedServiceLoad(_service) {
        for (let service of Services)
        {
            if (!service.wantedServicesIds.includes(_service.id)) continue;
            Logger.log("Loaded wanted service " + _service.id + " of " + service.id + ".", null, 'SERVICES');
            service.Services[_service.id] = _service;
            service.onWantedServiceLoad(_service);
        }
    } 
}





class ServiceInterface {
	config;
	id;
	process;
	enabled = false;
	condition = {};

	Services = {};

	get requiredServiceIds() {
		return this.config.needs || [];
	}
	get wantedServicesIds() {
		return this.config.wants || [];
	}

	constructor(_id, _config) {
		this.config = _config;
		this.id = _id;

		this.process = fork('serviceSpawner.js', [this.id]);

		this.process.on('message', (message) => {
		  console.log(`Message from child: ${message}`);
		});

		this.process.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});
	}

	async setup() {

	}
	async onEnable() {

	}

	onLoadRequiredServices(_services) {

	}
}
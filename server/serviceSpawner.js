import { FileManager } from './DBManager.js';
import { getPathToService } from './serviceManager.js';

const serviceId = process.argv[2];

let Service;
let LocalServiceStore = new Map();

(async () => {
	let path = await getPathToService(serviceId);
	let FM = new FileManager(path + "/config.json", {isAbsolutePath: true});
	let serviceConfig = await FM.getContent(true);

	await import(path + '/server/service.js').then((mod) => {
        Service = new mod.default({id: serviceId, config: serviceConfig});
    });


	console.log('Running service:', serviceId, process.pid, serviceConfig);
	process.on('message', handleMessage);
})();

function sendMessage(_messageObj) {
    process.send(JSON.stringify(_messageObj));
}
async function handleMessage(_message) {
	let message = JSON.parse(_message);

	console.log(`Message from parent:`, message,);
	switch (message.type)
	{
		case 'setup':
			let result = await Service.setup();
			return sendMessage({type: 'finishedSetup', data: result});
		case 'onLoadRequiredServices': 
			for (let serviceId of message.data)
			{
				if (LocalServiceStore.has(serviceId)) continue;
				LocalServiceStore.set(serviceId, new ServiceInterface(serviceId));
			}
			Service.onLoadRequiredServices(message.data.map(r => LocalServiceStore.get(r)));
			break;
		case 'onWantedServiceLoad':
			if (!LocalServiceStore.has(message.data)) {
				LocalServiceStore.set(message.data, new ServiceInterface(message.data));
			}
			Service.onWantedServiceLoad(LocalServiceStore.get(message.data));
			break;
	}

}



class ServiceInterface {
	id;
	constructor(_id) {
		this.id = _id;
	}

	subscribe({onEvent} = {}) {

	}



}
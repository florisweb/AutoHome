import { FileManager } from './DBManager.js';
import { getPathToService } from './serviceManager.js';

const serviceId = process.argv[2];


(async () => {
	let FM = new FileManager("services/" + serviceId + "/config.json");
	let serviceConfig = await FM.getContent(true);
	console.log('Running service:', serviceId, process.pid, serviceConfig);

	setTimeout(() => console.log('end'), 10000);

})();


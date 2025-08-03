

import ServiceManager from './serviceManager.js';

(async () => {
	let successfullyLoaded = await ServiceManager.loadServices();
	if (!successfullyLoaded) process.exit();

	setTimeout(() => console.log('end main'), 11000);
})()


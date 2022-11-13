
import path from 'path';
import fse from 'fs-extra';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import ServiceManager from '../server/serviceManager.js';

const ServiceDirectory = getCurDir() + '/../server/services/';
const ServiceOutputDir = getCurDir() + '/src/js/_services/';

await fse.emptyDir(ServiceOutputDir);
await wait(10);



let services = ServiceManager.getUIServices().map((service) => service.id);
for (let serviceId of services) {
	let curDir = ServiceDirectory + serviceId + '/interface';
	symlink(curDir, ServiceOutputDir + serviceId);
}




function wait(_dt) {
	return new Promise((resolve) => {
		setTimeout(resolve, _dt);
	})
}


function symlink(_sourceLocation, _targetLocation) {
	fs.symlink(
		_sourceLocation,
        _targetLocation, 
        'file', 
        (err) => {
	  		if (err && err.code !== 'EEXIST') console.log(err);
		}
	)
}



function getCurDir() {
    return dirname(fileURLToPath(import.meta.url));
}
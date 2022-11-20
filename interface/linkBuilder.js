
import path from 'path';
import fse from 'fs-extra';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import ServiceManager from '../server/serviceManager.js';

const ServiceDirectory = getCurDir() + '/../server/services/';
const ServiceOutputDir = getCurDir() + '/src/js/_services/';



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


const linkBuilder = {
	build: async function() {
		await fse.emptyDir(ServiceOutputDir);
		await wait(50);

		let services = ServiceManager.getUIServices().map((service) => service.id);
		for (let serviceId of services) {
			let curDir = ServiceDirectory + serviceId + '/interface';
			symlink(curDir, ServiceOutputDir + serviceId);
		}
	}
}


export default linkBuilder;


export function getCurDir() {
    return dirname(fileURLToPath(import.meta.url));
}

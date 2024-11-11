
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
		await ServiceManager.loadingPromise;

		let includeFileContent = '';

		let services = ServiceManager.getUIServices().map((service) => service.id);
		if (services.includes('SceneManager')) services = ["SceneManager", ...services.filter(r => r !== "SceneManager")];

		console.log('Loaded UI Services: ' + services.join(', '));
		for (let serviceId of services) {
			let curDir = ServiceDirectory + serviceId + '/interface';
			fse.copySync(curDir, ServiceOutputDir + serviceId, {overwrite: true, recursive: true});

			includeFileContent += 'import ' + serviceId + ' from "./' + serviceId + '/interface.jsx";\n';
		}
		includeFileContent += 'let ServiceIncludes = {'
			+ services.map((id) => id + ': ' + id).join(',') + 
		'};';
		includeFileContent += 'export default ServiceIncludes;';

		fs.writeFile('src/js/_services/includer.js', includeFileContent, err => {
		  if (err) console.error(err);
		});
	}
}


export default linkBuilder;


export function getCurDir() {
    return dirname(fileURLToPath(import.meta.url));
}

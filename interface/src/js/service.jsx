import Server from './server/server.js';
import { Page, PageHeader} from './page.jsx';

export const ServiceManager = new function() {
	this.services = [];
	this.register = function(_service) {
		this.services.push(_service);
	}
	this.getService = function(_id) {
		return this.services.find((_service) => _service.serviceId == _id);
	}
}
window.ServiceManager = ServiceManager;







export class Service {
	id;
	name;
	page;
	panel;

	constructor({id, name, pageContructor, panelConstructor}) {
		this.id = id;
		this.name = name;

		if (pageContructor) this.page = new pageContructor(this);
		if (panelConstructor) this.panel = new panelConstructor(this);

		Server.registerServiceListener(this);
		ServiceManager.register(this);
	}
	

	// Functional Aspects
	onEvent() {
		console.log("Service " + this.serviceId + " doesn't have it's onEvent handler set yet.", ...arguments)
	};
	send(_json) {
		_json.serviceId = this.serviceId;
		return Server.send(_json);
	};

	identify() {
		this.send({type: "identify"});
	}
}



export class ServicePage extends Page {
	service;
	header;
	constructor({headerConfig}, _service) {
		super();
		this.service = _service;

		this.header = new PageHeader(headerConfig);
		this.header.html.rightButton.onclick = function() {
			MainContent.serviceConfigPage.open(_service);
		};
		this.header.html.leftButton.onclick = function() {
			MainContent.homePage.open();
		};
	}

	// renderContent() {
	// 	return [
	// 		this.header.render()
	// 	]
	// }
} 

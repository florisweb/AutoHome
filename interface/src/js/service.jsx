import Server from './server/server.js';
import { Page, PageHeader} from './page.jsx';
import { RequestMessage } from './server/message.js';

const ServiceManager = new function() {
	const ServiceId = 'serviceManager';
	this.services = [];

	this.setup = async function() {
		for (let service of this.services) service.setup();
	}

	this.register = function(_service) {
		this.services.push(_service);
	}
	this.getService = function(_id) {
		return this.services.find((_service) => _service.id == _id);
	}

	this.getServiceConditions = async function() {
		let message = new RequestMessage({serviceId: ServiceId, type: 'getServiceConditions'});
		let state = await message.send();;
		for (let serviceId in state)
		{
			for (let service of this.services)
			{
				if (service.id !== serviceId) continue;
				service.enabled = state[serviceId].enabled;
				break;
			}
		}

		return state;
	}

	this.setEnableState = function(_serviceId, _enable) {
		let message = new RequestMessage({serviceId: ServiceId, type: 'setServiceEnableState', data: {serviceId: _serviceId, enable: _enable}})
		return message.send();
	}
}

export default ServiceManager;



export class Service {
	id;
	name;
	page;
	panel;
	iconSrc;

	
	#args;
	#enabled = false;
	set enabled(_value) {
		this.#enabled = _value;
		this.panel?.setVisibility(_value);
	}

	get enabled() {
		return this.#enabled;
	}

	constructor({id, name, pageConstructor, panelConstructor, iconSrc}) {
		this.id = id;
		this.name = name;
		this.iconSrc = iconSrc;

		this.#args = arguments[0];
		ServiceManager.register(this);
	}

	setup() {
		if (this.#args.pageConstructor) this.page = new this.#args.pageConstructor(this);
		if (this.#args.panelConstructor) this.panel = new this.#args.panelConstructor(this);
		Server.registerServiceListener(this);
	}
	

	// Functional Aspects
	onEvent() {
		console.log("Service " + this.id + " doesn't have it's onEvent handler set yet.", ...arguments)
	};
	send(_json) {
		_json.serviceId = this.id;
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

		let config = {
			pageIconSrc: _service.iconSrc,
			...headerConfig,
		};
		if (config.rightButtonSrc === undefined) config.rightButtonSrc = 'images/hamburgerIcon.png';
		this.header = new PageHeader(config);
		this.header.title = _service.name;
		
		if (config.rightButtonSrc) this.header.html.rightButton.onclick = function() {
			MainContent.serviceConfigPage.open(_service);
		};
		this.header.html.leftButton.onclick = function() {
			MainContent.homePage.open();
		};
	}

	renderContent() {
		return [
			this.header.render()
		]
	}
} 








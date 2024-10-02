import Server from './server/server.js';
import { Page, PageHeader} from './page.jsx';
import { RequestMessage, Message } from './server/message.js';

const ServiceManager = new function() {
	const ServiceId = 'ServerManager';
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
		let state = await message.send();
		let hasError = false;
		let hasWarning = false;
		for (let serviceId in state)
		{
			for (let service of this.services)
			{
				if (service.id !== serviceId) continue;
				service.enabled = state[serviceId].enabled;

				if (!service.enabled) continue;
				if (state[serviceId].warning) hasWarning = true;
				if (state[serviceId].error) hasError = true;
				break;
			}
		}

		MainContent.homePage.header.html.rightButton.classList.toggle('warning', hasWarning);
		MainContent.homePage.header.html.rightButton.classList.toggle('error', hasError);
		return state;
	}

	this.setEnableState = function(_serviceId, _enable) {
		let message = new RequestMessage({serviceId: ServiceId, type: 'setServiceEnableState', data: {serviceId: _serviceId, enable: _enable}})
		return message.send();
	}

	this.restartServer = function() {
		let message = new Message({serviceId: ServiceId, type: 'restart'});
		message.send();
		Server.disconnect();
		let refreshPageInterval;
		refreshPageInterval = setInterval(() => {
			if (!Server.connected) return;
			MainContent.systemPage.open();
			clearInterval(refreshPageInterval)		
		}, 1000);
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
	onEvent(_event) {
		switch (_event.type)
		{
			case "curState": 
				this.curState = _event.data;
				this.onStateChange(this.curState);
			break;
		}
	};

	onStateChange(_state) {
		if (this.panel?.setOnlineState) this.panel.setOnlineState(_state.deviceOnline);
	}
	
	send(_json) {
		_json.serviceId = this.id;
		return Server.send(_json);
	};

	identify() {
		this.send({type: "identify"});
	}

	getDeviceInfo() {
		let message = new RequestMessage({
			type: 'getDeviceInfo',
			serviceId: this.id
		}, this);
		return message.send();
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








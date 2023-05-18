import Server from './server/server.js';
import ServiceIncludes from './_services/includer.js';
console.log(ServiceIncludes);


export const ServiceManager = new function() {
	this.services = [];
	this.register = function(_service) {
		this.services.push(_service);
	}
	this.getService = function(_id) {
		return this.services.find((_service) => _service.serviceId == _id);
	}
}



function Service({serviceId, name, icon, homeScreenPanel, servicePage}) {
	this.serviceId 			= serviceId;
	this.name			 	= name;
	this.serviceIcon		= icon;

	this.homeScreenPanel 	= homeScreenPanel;
	this.servicePage 		= servicePage;
	if (this.homeScreenPanel) 	this.homeScreenPanel.service = this;
	if (this.servicePage) 		this.servicePage.service = this;

	Server.registerServiceListener(this);
	ServiceManager.register(this);

	this.getIconSrc = function() {console.warn('[Service] No icon for service', this.serviceId, 'yet.')}

	this.onEvent = () => {console.log("Service " + this.serviceId + " doesn't have it's onEvent handler set yet.", ...arguments)};
	this.send = (_json) => {
		_json.serviceId = this.serviceId;
		return Server.send(_json);
	};

	this.identify = () => {
		this.send({type: "identify"});
	}
}


function ServicePage(_params = {headerConfig: {}, serviceInfo: {}}) {
	const This = this;
	this.html = {};
	this.openState = true; // TODO
	this.serviceInfo = _params.serviceInfo;

	PageWithHeader.call(this, {
		..._params,
		title: _params.serviceInfo.name,
		headerConfig: {
			..._params.headerConfig,
			pageIconSrc: _params.serviceInfo.icon,
			rightButtonSrc: 'images/hamburgerIcon.png',
			pageIconInBox: true,
		},
	});

	this.HTML.rightButton.onclick = function() {
		MainContent.serviceConfigPage.open(ServiceManager.getService(This.serviceInfo.serviceId));
	};
	this.HTML.leftButton.onclick = function() {
		MainContent.homePage.open();
	};

	this.render = this.renderPageContent;
} 
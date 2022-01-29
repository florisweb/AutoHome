
const ServiceManager = new function() {
	this.services = [];
	this.register = function(_service) {
		this.services.push(_service);
	}
}


function Service({serviceId, name, homeScreenPanel, servicePage}) {
	this.serviceId 			= serviceId;
	this.name			 	= name;

	this.homeScreenPanel 	= homeScreenPanel;
	this.servicePage 		= servicePage;
	if (this.homeScreenPanel) 	this.homeScreenPanel.service = this;
	if (this.servicePage) 		this.servicePage.service = this;

	Server.registerServiceListener(this);
	ServiceManager.register(this);

	this.onEvent = () => {console.log("Service " + this.serviceId + " doesn't have it's onEvent handler set yet.", ...arguments)};
	this.send = (_json) => {
		_json.serviceId = this.serviceId;
		return Server.send(_json);
	};
}


function ServicePage() {
	this.html = {};
	this.openState = true; // TODO

	this.render = function() {
		return <div></div>;
	}
} 

const ServiceManager = new function() {
	this.services = [];
	this.register = function(_service) {
		this.services.push(_service);
	}
}


function Service({serviceId, homeScreenPanel}) {
	this.serviceId 			= serviceId;
	this.homeScreenPanel 	= homeScreenPanel;
	Server.registerServiceListener(this);
	ServiceManager.register(this);

	this.onEvent = () => {console.log("Service " + this.serviceId + " doesn't have it's onEvent handler set yet.", ...arguments)};
	this.send = (_json) => {
		_json.serviceId = this.serviceId;
		return Server.send(_json);
	};
}
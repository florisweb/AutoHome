
function Service({serviceId}) {
	this.serviceId 	= serviceId;
	Server.registerServiceListener(this);

	this.onEvent = () => {console.log("Service " + this.serviceId + " doesn't have it's onEvent handler set yet.", ...arguments)};
	this.send = (_json) => {
		_json.serviceId = this.serviceId;
		return Server.send(_json);
	};
}
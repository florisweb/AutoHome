
const Server = new function() {
	const This = this;
	this.authenticated = false;

	this.serviceListeners = [];
	this.registerServiceListener = (_service) => {this.serviceListeners.push(_service)}

	let Socket;
	this.setup = function() {
		// Socket = new WebSocket('ws://' + window.location.hostname + ':8081/'); 
		Socket = new WebSocket('ws://thuiswolk.local:8081/'); 
		Socket.onmessage = function(_event) { 
			let message = JSON.parse(_event.data); 
			if (message.type == 'auth')
			{
				This.authenticated = message.status;
				console.warn("[Server].authenticated = ", This.authenticated);
				if (!message.status) Auth.clearKey();
				return;
			}
			
			let service = This.serviceListeners.find((_service) => {return _service.serviceId == message.serviceId});
			service.onEvent(message);
		};

		Socket.onopen = function() {
			// Authenticate as interfaceClient
			Socket.send(JSON.stringify({id: "InterfaceClient", key: Auth.getKey()}));
		}
	}

	this.send = function(_json) {
		if (!this.authenticated) return;
		Socket.send(JSON.stringify(_json));
	}
}


const Server = new function() {
	const This = this;
	this.authenticated = false;

	this.serviceListeners = [];
	this.registerServiceListener = (_service) => {this.serviceListeners.push(_service)}

	let Socket;
	this.setup = () => {return this.connect()}
	this.connect = function() {
		// Socket = new WebSocket('ws://' + window.location.hostname + ':8081/'); 
		Socket = new WebSocket('ws://thuiswolk.local:8081/'); 
		Socket.onmessage = function(_event) { 
			let message = JSON.parse(_event.data);
			console.log(message);
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
		
		Socket.onclose = function() {
			console.log('closed, reconnecting...');
			setTimeout(() => {
				Server.connect();
			}, 1000);
		}
	}

	this.send = function(_json) {
		if (!this.authenticated) return;
		Socket.send(JSON.stringify(_json));
	}
}

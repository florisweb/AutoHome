
const Server = new function() {
	const This = this;
	this.authenticated = false;

	this.serviceListeners = [];
	this.registerServiceListener = (_service) => {this.serviceListeners.push(_service)}

	let Socket;
	this.setup = () => {return this.connect(true)}
	this.connect = function(_connectToProxy = false) {
		let serverUrl = _connectToProxy ? 'wss://thuiswolk.ga:8081/' : 'ws://thuiswolk.local:8081/';
		Socket = new WebSocket(serverUrl);
		this.Socket = Socket;
		Socket.onmessage = function(_event) { 
			console.log(window.e = _event, _event.data)
			let message = JSON.parse(_event.data);
			console.log(message);
			if (message.type == 'auth')
			{
				This.authenticated = message.status;
				if (This.authenticated) logoBackground.classList.add('hide');
				console.warn("[Server].authenticated = ", This.authenticated);
				if (!message.status) 
				{
					Auth.clearKey();
					window.location.replace('https://user.florisweb.dev/login?APIKey=TESTSERVICE');
				}
				return;
			}
			
			let service = This.serviceListeners.find((_service) => {return _service.serviceId == message.serviceId});
			if (!service) return;
			service.onEvent(message);
		};

		Socket.onopen = function() {
			if (_connectToProxy)
			{
				Socket.send(JSON.stringify({
					isServerMessage: true, 
					proxyId: 'thuisWolkProxy',
					key: 'client here'
				}));
				return;
			} 

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

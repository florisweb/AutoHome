
const Server = new function() {
	const This = this;
	const primaryUrl = 'ws://thuiswolk.local:8081/';
	const proxyUrl = 'wss://thuiswolk.ga:8081/';

	this.serviceListeners = [];
	this.registerServiceListener = (_service) => {this.serviceListeners.push(_service)}

	this.connectedToProxy = false;

	let Socket;
	this.setup = () => {
		upgradeSocketLoop();
		return this.connect();
	}
	this.isConnected = function() {
		return Socket && Socket.readyState == 1;
	}

	this.connect = function(_connectToProxy = false) {
		this.connectedToProxy = _connectToProxy;
		let serverUrl = _connectToProxy ? proxyUrl : primaryUrl;
		Socket = new WebSocket(serverUrl);
		console.log("[Server] Starting to connect to ", serverUrl);

		this.Socket = Socket;
		Socket.onmessage = function(_event) { 
			let message = JSON.parse(_event.data);
			console.log(message);
			if (message.type == 'auth')
			{
				if (message.status) logoBackground.classList.add('hide');
				console.warn("[Server].authenticated = ", message.status);
				if (!message.status) 
				{
					Auth.clearKey();
					window.location.replace('https://user.florisweb.dev/login?APIKey=TESTSERVICE');
				}
				return;
			}
			
			if (message.type == 'proxyKey') return Auth.setProxyKey(message.data);
			if (message.isProxyServerMessage && message.type == 'ProxyConnectState')
			{
				return Socket.send(JSON.stringify({id: "InterfaceClient", key: Auth.getKey()}));
			}
			
			let service = This.serviceListeners.find((_service) => {return _service.serviceId == message.serviceId});
			if (!service) return;
			service.onEvent(message);
		};

		Socket.onopen = function() {
			if (_connectToProxy)
			{
				return Socket.send(JSON.stringify({
					isProxyServerMessage: true, 
					proxyId: 'thuisWolkProxy',
					key: Auth.getProxyKey()
				}));
			}

			// Authenticate as interfaceClient
			Socket.send(JSON.stringify({id: "InterfaceClient", key: Auth.getKey()}));
		}
		
		Socket.onclose = function() {
			console.log('closed, reconnecting...');
			setTimeout(() => {
				Server.connect(!This.connectedToProxy);
			}, 5000);
		}
	}
	
	async function upgradeSocketLoop() {
		if (This.connectedToProxy)
		{
			let primaryServerAvailable = await This.checkUrlAvailability(primaryUrl);
			console.log('[Server] Trying to upgrade:', primaryServerAvailable);
			if (primaryServerAvailable) Server.connect(false);
		}

		setTimeout(upgradeSocketLoop, 1000 * 30);
	}


	this.send = function(_json) {
		if (!this.isConnected()) return;
		Socket.send(JSON.stringify(_json));
	}


	this.checkUrlAvailability = function(_url) {
		return new Promise((resolve, reject) => {
			try {
				let socket = new WebSocket(_url)
				socket.onopen = () => {
					resolve(true);
					socket.close();
				};

				setTimeout(() => {
					resolve(socket.readyState == 1);
				}, 500);
			} catch (e) {
				resolve(false);
			}
		});
	}
}

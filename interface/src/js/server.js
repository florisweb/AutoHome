
const Server = new function() {
	const HTML = {
		loadingScreen: logoBackground,
		authButton: signInWithFloriswebButton
	}
	const This = this;
	const primaryUrl = 'ws://thuiswolk.local:8081/';
	const proxyUrl = 'wss://thuiswolk.ga:8081/';
	const connectionTimeoutLength = 1000 * 5;

	this.serviceListeners = [];
	this.registerServiceListener = (_service) => {this.serviceListeners.push(_service)}

	this.connectedToProxy = false;
	this.authenticated = false;
	let waitingForAuthentication = false;
	let primaryServerUnavailable = false;

	let Socket;
	this.setup = () => {
		upgradeSocketLoop();
		return this.connect();
	}
	this.isConnected = function() {
		return Socket && Socket.readyState == 1;
	}
	this.setAuthenticationState = function(_authed) {
		this.authenticated = _authed;
	}

	function requireAuthentication() {
		openLoadScreen();
		Auth.clearKey();
		waitingForAuthentication = true;
		HTML.authButton.classList.remove('hide');
		This.setAuthenticationState(false);
	}
	function openLoadScreen() {
		HTML.loadingScreen.classList.remove('hide');
		HTML.authButton.classList.add('hide');
	}
	function closeLoadScreen() {
		HTML.loadingScreen.classList.add('hide');
	}


	let connectionAttempts = 0;
	this.connect = function(_connectToProxy = false) {
		if (waitingForAuthentication) return; // Not relevant to try to connect since you can't authenticate anyway
		this.disconnect();
		this.setAuthenticationState(false);
		primaryServerUnavailable = false;
		connectionAttempts++;


		let serverUrl = _connectToProxy ? proxyUrl : primaryUrl;
		this.connectedToProxy = _connectToProxy;
		

		console.log("[Server] Starting to connect to ", serverUrl);

		Socket = new WebSocket(serverUrl);
		this.Socket = Socket;
		setTimeout(() => {
			if (This.isConnected()) return;
			console.warn('[Server] Current connection attempt timed out.');
			primaryServerUnavailable = true;
			This.disconnect();
		}, connectionTimeoutLength);

		Socket.onmessage = function(_event) { 
			let message = JSON.parse(_event.data);
			console.log(message);
			if (message.type == 'auth')
			{
				console.warn("[Server].authenticated = ", message.status);
				
				This.setAuthenticationState(message.status);
				if (message.status) return closeLoadScreen();
				return requireAuthentication();
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
			connectionAttempts = 0;
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
		Socket.onerror = function() {
			console.log('error', ...arguments);
		}
		
		Socket.onclose = function() {
			if (waitingForAuthentication) return; // Not relevant to try to reconnect since you can't authenticate anyway
			openLoadScreen();
			console.log('closed, reconnecting...', connectionAttempts);
			setTimeout(() => {
				Server.connect(primaryServerUnavailable);
			}, 5000 * Math.pow(2, connectionAttempts));
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

	this.disconnect = function() {
		try {
			Socket.close();
		} catch (e) {};
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
				}, connectionTimeoutLength);
			} catch (e) {
				resolve(false);
			}
		});
	}
}

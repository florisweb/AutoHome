
const Server = new function() {
	const HTML = {
		loadingScreen: logoBackground,
		authButton: signInWithFloriswebButton
	}
	const This = this;
	const primaryWebServer = 'http://thuiswolk.local:8080';
	const proxyWebServer = 'https://thuiswolk.ga';
	const primaryUrl = 'ws://thuiswolk.local:8081/';
	const proxyUrl = 'wss://thuiswolk.ga:8081/';
	const connectionTimeoutLength 	= 5 * 1000;
	const heartbeatFrequency 		= 10 * 1000;

	this.serviceListeners = [];
	this.registerServiceListener = (_service) => {this.serviceListeners.push(_service)}

	this.connectedToProxy = false;
	this.authenticated = false;
	let waitingForAuthentication = false;
	let primaryServerUnavailable = false;

	let Socket;
	this.setup = async () => {
		setInterval(heartbeatLoop, heartbeatFrequency);

		this.smartConnect();
	}

	this.smartConnect = async function() {
		if (this.siteIsPrimaryServer()) // Local server
		{
			let connected = await this.connect(false);
			if (connected || waitingForAuthentication) return true;
			// window.location.replace(proxyWebServer);
			return false;
		} else { // Proxy Server
			let promise = this.connect(true);
			let available = await this.primaryServerAvailable();
			if (available && !waitingForAuthentication) return 
				// window.location.replace(primaryWebServer);
			return promise;
		}
	}


	this.isConnected = function() {
		return Socket && Socket.readyState == 1;
	}
	this.setAuthenticationState = function(_authed) {
		this.authenticated = _authed;
	}

	this.requireProxyAuthentication = function() {
		openLoadScreen();
		Auth.clearProxyKey();
		waitingForAuthentication = true;
		HTML.authButton.classList.remove('hide');
		This.setAuthenticationState(false);
	}

	this.requireAuthentication = function() {
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

	
	this.configureServers = function() {
		this.siteIsPrimaryServer();
	}


	let connectionAttempts = 0;
	this.connect = function(_connectToProxy = false) {
		if (waitingForAuthentication) return false; // Not relevant to try to connect since you can't authenticate anyway
		this.disconnect();
		this.setAuthenticationState(false);
		primaryServerUnavailable = false;
		connectionAttempts++;


		let serverUrl = _connectToProxy ? proxyUrl : primaryUrl;
		this.connectedToProxy = _connectToProxy;
		

		return new Promise((resolve) => {
			console.log("[Server] Starting to connect to ", serverUrl);

			Socket = new WebSocket(serverUrl);
			This.Socket = Socket;

			// Connect attempt timed out
			setTimeout(() => {
				if (This.isConnected()) return;
				console.warn('[Server] Current connection attempt timed out.');
				primaryServerUnavailable = true;
				This.disconnect();
				resolve(false);
			}, connectionTimeoutLength);

			Socket.onmessage = function(_event) { 
				let message = JSON.parse(_event.data);
				switch (message.type)
				{
					case 'heartbeat': lastHeartbeat = new Date(); break;
					case 'auth': 
						console.warn("[Server].authenticated = ", message.status);
						
						This.setAuthenticationState(message.status);
						if (!message.status) return This.requireAuthentication();
						resolve(true);
						closeLoadScreen();
					break;
					case 'proxyKey': Auth.setProxyKey(message.data); break;
					case 'ProxyConnectState': 
						if (!message.isProxyServerMessage) return;
						Socket.send(JSON.stringify({id: "InterfaceClient", key: Auth.getKey()}));
					break;
					default: handleSocketMessage(message); break;
				}
			};

			Socket.onopen = function() {
				connectionAttempts = 0;
				lastHeartbeat = new Date();
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
				resolve(false);
				console.log('error', ...arguments);
			}
			
			Socket.onclose = function() {
				resolve(false);
				if (waitingForAuthentication) return; // Not relevant to try to reconnect since you can't authenticate anyway
				openLoadScreen();
				console.log('closed, reconnecting...', connectionAttempts);
				setTimeout(() => {
					Server.smartConnect();
				}, 5000 * Math.pow(2, connectionAttempts));
			}
		});
	}

	function handleSocketMessage(_message) {
		console.log(_message);
		let service = This.serviceListeners.find((_service) => {return _service.serviceId == _message.serviceId});
		if (!service) return;
		service.onEvent(_message);
	}

	

	let lastHeartbeat = new Date();
	function heartbeatLoop() {
		if (!This.isConnected()) return;
		if (new Date() - lastHeartbeat < heartbeatFrequency * 1.1) return;
		console.warn("[Server] Connection timed out due to a missing heartbeat.");
		This.disconnect();
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



	this.primaryServerAvailable = function() {
		return serverAvailable(primaryWebServer);
	}


	function serverAvailable(_url) {
		return new Promise((resolve) => {
			let img = document.createElement('img');
			img.setAttribute('src', _url + '/images/logo.png');
			img.onerror = function() {
				resolve(false);
			}
			img.onload = function() {
				resolve(true);
			}
			setTimeout(() => {
				resolve(false);
			}, connectionTimeoutLength);
		});
	}


	this.siteIsPrimaryServer = function() {
		let url = window.location.href.split('/')[2];
		return url == 'localhost:8080' || url == primaryWebServer.split('/')[2];
	}
}

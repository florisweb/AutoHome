const PROXY = Symbol();
const DIRECT = Symbol();
const Server = new function() {
	const HTML = {
		loadingScreen: logoBackground,
		authButton: signInWithFloriswebButton,
		setProxyKeyMenu: document.querySelector('.setProxyKeyMenu'),
		proxyKeyInputField: proxyKeyInputField,
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


	this.mode = PROXY;
	this.setup = function() {
		this.mode = this.siteIsPrimaryServer() ? DIRECT : PROXY;

		this.connectAccordingToMode();
	}

	let Socket;
	let connectionAttempts = 0;
	this.connectAccordingToMode = function() {
		if (this.mode == PROXY) return this.proxyConnect();
		return this.directConnect();
	}


	this.directConnect = function() {
		let serverAuthenticated = false;
		connectionAttempts++;
		

		let onOpen = () => {
			Socket.send(JSON.stringify({id: "InterfaceClient", key: Auth.getKey()}));
		}
		let onError = (_error) => {
			console.log('error', _error);
			Server.showMessage(_error);
		}
		let onClose = () => {
			setTimeout(() => {This.connectAccordingToMode()}, 1000 * 5);
			console.log('close');
		}
		let onMessage = (_message) => {
			console.log('onMessage', _message);
			switch (_message.type)
			{
				case 'auth':
					serverAuthenticated = _message.status;

					if (!serverAuthenticated) 
					{
						This.disconnect();
						return This.requireAuthentication();
					}
					
					closeLoadScreen();
				break;
				default: handleSocketMessage(_message); break;
			}
		}

		return connect(DIRECT, onOpen, onError, onClose, onMessage);
	}


	this.proxyConnect = function() {
		let proxyAuthenticated = false;
		let serverAuthenticated = false;

		connectionAttempts++;
	

		let onOpen = () => {
			Socket.send(JSON.stringify({
				isProxyServerMessage: true, 
				proxyId: 'thuisWolkProxy',
				key: Auth.getProxyKey()
			}));
		}
		let onError = (_error) => {
			console.log('error', _error);
			Server.showMessage(_error);
		}
		let onClose = () => {
			setTimeout(() => {This.connectAccordingToMode()}, 1000 * 5);
			console.log('close');
		}
		let onMessage = (_message) => {
			console.log('onMessage', _message);
			if (!proxyAuthenticated)
			{
				if (!_message.isProxyServerMessage) return;
				if (_message.error) return Server.showMessage(_message.error);
				if (_message.type != "ProxyConnectState") return;
				proxyAuthenticated = _message.data;
				if (!proxyAuthenticated) 
				{
					This.disconnect();
					return This.requireProxyAuthentication();
				}
				
				console.log('[Server.proxy]: Connected to proxy');

				Socket.send(JSON.stringify({id: "InterfaceClient", key: Auth.getKey()}));
				return;
			}

			if (_message.isProxyServerMessage)
			{
				console.log('Message from proxy', _message);
				// if (_message.type == 'ProxyConnectState')
				return;
			}


			switch (_message.type)
			{
				case 'auth':
					serverAuthenticated = _message.status;

					if (!serverAuthenticated) 
					{
						This.disconnect();
						return This.requireAuthentication();
					}
					
					closeLoadScreen();
				break;
				default: handleSocketMessage(_message); break;
			}
		}

		return connect(PROXY, onOpen, onError, onClose, onMessage);
	}

	this.showMessage = (_message) => {
		console.info("[SERVER: show user]", _message);
	}






	function connect(_mode, _onOpen, _onError, _onClose, _onMessage) {
		let serverUrl = _mode == PROXY ? proxyUrl : primaryUrl;
		console.log("[Server] Starting to connect to ", serverUrl, _mode);

		Socket = new WebSocket(serverUrl);
		This.Socket = Socket;

		Socket.onmessage = function(_event) { 
			let message = JSON.parse(_event.data);
			switch (message.type)
			{
				case 'heartbeat': lastHeartbeat = new Date(); break;
				default: _onMessage(message); break;
			}
		};

		Socket.onopen = function() {
			connectionAttempts = 0;
			_onOpen();
		}

		Socket.onerror = function(_e) {
			_onError(_e);
		}
		
		Socket.onclose = function() {
			_onClose();
		}
	}

	this.disconnect = function() {
		if (!Socket) return;
		return Socket.close();
	}

	this.isConnected = function() {
		return Socket && Socket.readyState == 1;
	}

	this.send = function(_json) {
		if (!this.isConnected()) return;
		Socket.send(JSON.stringify(_json));
	}

	this.setAuthenticationState = function(_authed) {
		this.authenticated = _authed;
	}











	function handleSocketMessage(_message) {
		console.log(_message);
		let service = This.serviceListeners.find((_service) => {return _service.serviceId == _message.serviceId});
		if (!service) return;
		service.onEvent(_message);
	}

















	this.requireProxyAuthentication = function() {
		openLoadScreen();
		Auth.clearProxyKey();
		waitingForAuthentication = true;
		HTML.proxyKeyInputField.value = null;
		HTML.setProxyKeyMenu.classList.remove('hide');
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
		HTML.setProxyKeyMenu.classList.add('hide');
		HTML.authButton.classList.add('hide');
	}
	function closeLoadScreen() {
		HTML.loadingScreen.classList.add('hide');
	}














	this.siteIsPrimaryServer = function() {
		let url = window.location.href.split('/')[2];
		return url == 'localhost:8080' || url == primaryWebServer.split('/')[2];
	}
}

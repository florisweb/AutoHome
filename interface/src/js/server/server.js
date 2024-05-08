import Auth from '../auth.js';
import { AuthMessage } from './message.js';
import RequestManager from './message.js';

const PROXY = Symbol();
const DIRECT = Symbol();



const Server = new class {
	#HTML = {
		loadingScreen: logoBackground,
		authButton: signInWithFloriswebButton,
	}

	// socketServerURL = 'ws://' + window.location.hostname + ':8081';
	socketServerURL = 'ws://thuiswolk.local:8081';
	Socket;
	authenticated = false;

	#lastHeartbeat = new Date();

	#serviceListeners = [];
	registerServiceListener = (_service) => {this.#serviceListeners.push(_service)}


	get connected() {
		return this.Socket && this.Socket.readyState == 1;
	}


	setup() {
		return this.connect();
	}


	connect() {
		let serverAuthenticated = false;

		this.Socket = new WebSocket(this.socketServerURL);
		this.Socket.onmessage = (_event) => { 
			let message = JSON.parse(_event.data);
			switch (message.type)
			{
				case 'heartbeat': this.#lastHeartbeat = new Date(); break;
				default: 
					if (message.isResponse) return RequestManager.onMessageReceive(message);
					let service = this.#serviceListeners.find((_service) => {return _service.id == message.serviceId});
					if (!service) return;
					service.onEvent(message);
				break;
			}
		};

		this.Socket.onopen = async () => {
			let message = new AuthMessage({id: "InterfaceClient", key: Auth.getKey()});
			let response = await message.send();
			if (response.type !== 'auth') return;

			serverAuthenticated = response.status;
			if (!serverAuthenticated) 
			{
				this.disconnect();
				return this.requireAuthentication();
			}			
			this.#closeLoadScreen();
		}

		this.Socket.onerror = function(_error) {
			console.log('onError', _error);
			Server.showMessage(_error);
		}
		
		this.Socket.onclose = () => {
			console.log('onClose');
			this.#openLoadScreen();
			setTimeout(() => this.connect(), 1000 * 5);
		}
	}


	showMessage(_message) {
		console.info("[SERVER: show user]", _message);
	}


	disconnect() {
		if (!this.Socket) return;
		return this.Socket.close();
	}


	send(_json) {
		if (!this.connected) return false;
		return this.Socket.send(JSON.stringify(_json));
	}

	requireAuthentication() {
		this.#openLoadScreen();
		Auth.clearKey();
		this.#HTML.authButton.classList.remove('hide');
		this.authenticated = false;
	}
	#openLoadScreen() {
		this.#HTML.loadingScreen.classList.remove('hide');
		this.#HTML.authButton.classList.add('hide');
	}
	#closeLoadScreen() {
		this.#HTML.loadingScreen.classList.add('hide');
	}
}



export default Server;
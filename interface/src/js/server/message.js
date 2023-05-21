import { newId } from '../extraFunctions.js';
import Server from './server.js';

const RequestManager = new class {
	#requests = [];

	registerRequest(_request) {
		let resolver, errorer;
		let requestWrapper = {
			id: 				newId(),
			request: 			_request,
			callbackPromise: 	new Promise((resolve, error) => {resolver = resolve; errorer = error}),
			resolve: 			resolver,
			error: 				errorer,
		}
		_request.requestId = requestWrapper.id;
		this.#requests.push(requestWrapper);
		requestWrapper.callbackPromise.then(
			() => this.removeRequestById(requestWrapper.id), 
			() => this.removeRequestById(requestWrapper.id)
		);

		if (_request.send() === false) requestWrapper.error();
		return requestWrapper;
	}

	removeRequestById(_id) {
		for (let i = 0; i < this.#requests.length; i++)
		{
			if (this.#requests[i].id !== _id) continue;
			this.#requests.splice(i, 1);
			return true;
		}
		return false;
	}
	getRequestById(_id) {
		for (let i = 0; i < this.#requests.length; i++)
		{
			if (this.#requests[i].id !== _id) continue;
			return this.#requests[i];
		}
		return false;
	}

	onMessageReceive(_message) {
		if (!_message.isResponse) return false;
		let wrapper = this.getRequestById(_message.requestId);
		if (!wrapper) return false;
		wrapper.resolve(_message.response);
		this.removeRequestById(wrapper.id);
		return true;
	}
}

export default RequestManager;


export class Message {
	type;
	data;
	serviceId;
	#service;

	isSend = false;

	constructor({type, data, serviceId}, _service) {
		this.type = type;
		this.data = data;
		this.serviceId = serviceId;
		this.#service = _service;
	}

	send() {
		if (this.isSend) return true;
		let sender = this.#service && typeof this.#service.send === 'function' ? this.#service : Server;
		if (sender.send(this) !== false) this.isSend = true;
		return this.isSend;
	}
}

export class RequestMessage extends Message {
	#requestWrapper;
	requestId;
	#requestRegistered;
	constructor() {
		super(...arguments);
	}
	send() {
		if (this.#requestRegistered) return super.send();
		this.#requestRegistered = true;

		this.#requestWrapper = RequestManager.registerRequest(this);
		return this.#requestWrapper.callbackPromise;
	}
}

export class AuthMessage extends RequestMessage {
	id;
	key;
	constructor({id, key}) {
		super(...arguments);
		this.id = id;
		this.key = key;
	}
}


export class PushMessage extends Message {
	
}




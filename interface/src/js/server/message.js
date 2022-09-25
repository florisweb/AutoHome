
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
		if (Server.send(_request) === false) requestWrapper.error();
		this.#requests.push(requestWrapper);
		requestWrapper.callbackPromise.then(
			() => this.removeRequestById(requestWrapper.id), 
			() => this.removeRequestById(requestWrapper.id)
		);
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



class Message {
	type;
	data;
	serviceId;

	isSend = false;

	constructor({type, data, serviceId}) {
		this.type = type;
		this.data = data;
		this.serviceId = serviceId;
	}

	send() {
		if (this.isSend) return true;
		if (Server.send(this) !== false) this.isSend = true;
		return this.isSend;
	}

}

class RequestMessage extends Message {
	#requestWrapper;
	requestId;
	constructor() {
		super(...arguments);
	}
	send() {
		this.#requestWrapper = RequestManager.registerRequest(this);
		return this.#requestWrapper.callbackPromise;
	}
}

class AuthMessage extends RequestMessage {
	id;
	key;
	constructor({id, key}) {
		super(...arguments);
		this.id = id;
		this.key = key;
	}
}


class PushMessage extends Message {
	
}




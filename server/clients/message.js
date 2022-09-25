const E_InvalidJSON = Symbol('E_InvalidJSON');


export function parseMessage(_string, _client) {
    let data = parseJSON(_string);
    if (data === E_InvalidJSON) return false;
    if (data.id && data.requestId) return new AuthMessage(data, _client);
    if (data.requestId) return new RequestMessage(data, _client);
    return new PushMessage(data, _client);
}


class Message {
    type;
    data;
    serviceId;
    _client;

    constructor({type, data, serviceId, requestId}, _client) {
        this.type = type;
        this.data = data;
        this.serviceId = serviceId;
        this._client = _client;
    }
}



class RequestMessage extends Message {
    isRequestMessage = true;
    requestId;
    constructor({type, data, serviceId, requestId}) {
        super(...arguments);
        this.requestId = requestId;
    }
    
    respond(_response) {
        this._client.send({
            isResponse: true,
            requestId: this.requestId,
            response: _response
        });
    }
}

class AuthMessage extends RequestMessage {
    isAuthMessage = true;
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




function parseJSON(_string) {
    try {
        return JSON.parse(_string);
    } catch (e) {return E_InvalidJSON};
}

#!/usr/bin/env node

const ProxyNotFoundError = Symbol();
const InvalidKeyError = Symbol();
const InvalidRequestError = Symbol();
const InternalError = Symbol();
const NotAuthenticatedWithinTimeError = Symbol();
const InvalidMessageError = Symbol();

const ErrorMessages = {};
ErrorMessages[ProxyNotFoundError]               = "Proxy not found";
ErrorMessages[InternalError]                    = "Internal Error";
ErrorMessages[InvalidKeyError]                  = "Invalid key";
ErrorMessages[InvalidRequestError]              = "Invalid request";
ErrorMessages[NotAuthenticatedWithinTimeError]  = "Not authenticated within time";
ErrorMessages[InvalidMessageError]              = "Invalid Message";


const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');

const Config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
const DOMAIN = "thuiswolk.ga";
const sshKeys = {
    key:    fs.readFileSync("/etc/letsencrypt/archive/" + DOMAIN + "/privkey1.pem"),
    cert:   fs.readFileSync("/etc/letsencrypt/archive/" + DOMAIN + "/fullchain1.pem"),
    ca:     fs.readFileSync("/etc/letsencrypt/archive/" + DOMAIN + "/chain1.pem")
};




var server = https.createServer(sshKeys);
server.listen(Config.port);
var wss = new WebSocket.Server({server: server});

console.log("[Status] Started socketServer on port " + Config.port);




wss.on('connection', function(ws, request, client) {// Web Socket
    let Client = new _Client(ws);
    Clients.push(Client);
    console.log('[Connect] Connected client ' + Client.id + ' from origin ' + request.headers.origin + '.');
});

let Clients = [];
Clients.removeClient = function(_id) {
    for (let i = 0; i < this.length; i++)
    {
        if (this[i].id != _id) continue;
        let client = this.splice(i, 1)[0];
        try {
            client.connection.close()
        } catch (e) {};
        return true;
    }
    return false;
};




const ProxyManager = new function() {
    this.proxies = [];

    this.getProxyById = function(_id) {
        return this.proxies.find((_proxy) => _id == _proxy.id);
    }

    this.createProxy = function(_owner, _id, _key) {
        let proxy = new _Proxy({id: _id, key: _key});
        let result = proxy.enableClient(_owner, _key);
        if (result) this.proxies.push(proxy);
        proxy.ownerClient = _owner;
        return result ? proxy : false;
    }
}





function _Client(_connection) {
    const This = this;
    this.id         = newId();
    this.enabled    = false;
    this.connection = _connection;

    setTimeout(() => {
        if (This.enabled) return;
        This.sendError(NotAuthenticatedWithinTimeError);
        This.remove();
    }, Config.authTimeLimit);
    this.connection.on('close', function(reasonCode, description) {
        console.log('[Remove] Client ' + This.id + " disconnected");
        This.remove();
    });



    this.connection.on('message', function(_message) {
        console.log("[Client] Received message from client " + This.id, _message.toString());
        if (!This.enabled) 
        {
            let result = This.enable(_message);
            if (typeof result == 'symbol') This.sendError(result);
            if (!result || typeof result == 'symbol') This.remove();
            return;
        }
        
        if (!This.proxy) return This.enabled = false;
        try {
            let message = JSON.parse(_message.toString());
            switch (message.type)
            {  
                case "disconnectClient":
                    if (This.id != This.proxy.ownerClient.id) return; // Only the owner is allowed to remove clients
                    let client = Clients.find((client) => client.id == message.data);
                    if (!client) return;
                    client.remove();
                break;
                default: This.proxy.send(This, message); break;
            }

        } catch (e) {This.sendError(InvalidMessageError)}
    });


    this.enable = function(_message) {
        try {
            let message = JSON.parse(_message);
            if (!message.isProxyServerMessage) return InvalidRequestError;

            let proxy = ProxyManager.getProxyById(message.proxyId);
            if (!proxy)
            {
                if (message.createProxyKey !== Config.createNewProxyKey) return ProxyNotFoundError;
                
                let result = ProxyManager.createProxy(this, message.proxyId, message.key);
                if (!result) return false;
                this.enabled = true;

                this.send(JSON.stringify({
                    isProxyServerMessage: true,
                    type: "CreateProxy",
                    data: {id: result.id, key: result.key}
                }));
                return true;
            }

            this.enabled = proxy.enableClient(this, message.key);
            return this.enabled;
        } catch (e) {console.log('an error accured', e); return InternalError; }
    }

    this.send = function(_str) {
        this.connection.send(_str);
    }

    this.sendError = function(_error) {
        this.sendPacket({
            error: ErrorMessages[_error]
        });
    }
    this.sendPacket = function(_packet) {
        this.send(JSON.stringify({
            ..._packet,
            isProxyServerMessage: true,
        }))   
    }


    this.remove = function() {;
        if (this.proxy) this.proxy.disconnectClient(this);
        Clients.removeClient(this.id);
    }
}



function _Proxy({id, key}) {
    this.id = id;
    this.key = key;
    this.clients = []; // First client is owner
    this.ownerClient = false;

    this.send = function(_client, _message) {
        _message.senderProxyClientId = _client.id;

        if (_message.targetProxyClientId)
        {
            let targetClient = this.clients.find((client) => client.id == _message.targetProxyClientId);
            if (!targetClient) return console.log("[Proxy] Client not found " + _message.targetProxyClientId);
            return targetClient.send(JSON.stringify(_message));
        }

        for (let client of this.clients)
        {
            if (client.id == _client.id) continue;
            client.send(JSON.stringify(_message));
        }
    }


    this.enableClient = function(_client, _key) {
        if (_key != this.key) 
        {
            console.log("[ProxyStatus] Failed to connect " + _client.id + " to proxy " + this.id, _key, this.clients.length);
            _client.sendPacket({type: "ProxyConnectState", data: false});
            return false;
        }
        
        this.clients.push(_client);
        _client.proxy = this;
        this.send(_client, {
            isProxyServerMessage: true,
            type: "clientConnect",
            data: _client.id,
        });
        _client.sendPacket({type: "ProxyConnectState", data: true});

        console.log("[Proxy] Enabled client " + _client.id + " in proxy " + this.id, this.clients.length);
        return true;
    }

    this.disconnectClient = function(_client) {
        for (let i = 0; i < this.clients.length; i++)
        {
            if (this.clients[i].id == _client.id)
            {
                this.clients.splice(i, 1);
                this.send(_client, {
                    isProxyServerMessage: true,
                    type: "clientDisconnect",
                    data: _client.id,
                });

                console.log('[Proxy] Disconnected client ' + _client.id + " from proxy " + this.id, this.clients.length);
                return true;
            }
        }
        return false;
    }
}













function newId() {return parseInt(Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000));}
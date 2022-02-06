#!/usr/bin/env node

const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');



const DOMAIN = "thuiswolk.ga";
const PORT = 8081;
const ALLOWED_ORIGINS = [];
const KEY_LENGTH = 5;
const sshKeys = {
    key:    fs.readFileSync("/etc/letsencrypt/archive/" + DOMAIN + "/privkey1.pem"),
    cert:   fs.readFileSync("/etc/letsencrypt/archive/" + DOMAIN + "/fullchain1.pem"),
    ca:     fs.readFileSync("/etc/letsencrypt/archive/" + DOMAIN + "/chain1.pem")
};





var server = https.createServer(sshKeys);
server.listen(PORT);
var wss = new WebSocket.Server({server: server});
console.log("[Status] Started socketServer on port " + PORT);



function originIsAllowed(origin) {
    return true;
    // return ALLOWED_ORIGINS.includes(origin);
}


wss.on('connection', function(ws, request, client) {// Web Socket
    let protocol = request.headers["sec-websocket-protocol"];

    if (!originIsAllowed(request.headers.origin)) 
    {
      ws.close();
      console.log('[Reject] Connection from origin ' + request.headers.origin + ' with protocol ' + protocol + ' rejected.');
      return;
    }

    console.log('[Connect] Connection from origin ' + request.headers.origin + ' with protocol ' + protocol + ' allowed.');

    let Client = new _Client(ws);
    Clients.push(Client);
});





const ProxyManager = new function() {
    this.proxies = [
        new _Proxy({id: 'thuisWolkProxy'})
    ];

    this.getProxyById = function(_id) {
        return this.proxies.find((_proxy) => _id == _proxy.id);
    }

    this.createProxy = function(_client, _message) {
        let proxy = new _Proxy({id: newId()});
        let result = proxy.enableClient(_client, _message);
        if (result) this.proxies.push(proxy);
        return result;
    }

}


let Clients = [];
Clients.removeClient = function(_id) {
    for (let i = 0; i < this.length; i++)
    {
        if (this[i].id != _id) continue;
        let client = this.splice(i, 1);
        if (client.connection) client.connection.close();
        return true;
    }
    return false;
};
Clients.findController = function(_key) {
    for (client of this)
    {
        if (client.type != "controller") continue;
        if (!client.enabled) continue;
        if (client.key != _key) continue;
        return client;
    }
    return false;
}




function _Client(_connection) {
    const This = this;
    this.id         = newId();
    this.enabled    = false;
    this.type       = false;
    this.connection = _connection;

    this.connection.on('message', function(_message) {
        if (!This.enabled) return This.enable(_message);
        if (!This.proxy) This.enabled = false;
        This.proxy.send(This, _message.toString());
    });

    this.connection.on('close', function(reasonCode, description) {
        console.log('[Disconnect] Client ' + This.id + " disconnected: " + reasonCode + " " + description);
        This.remove();
    });

    this.enable = function(_message) {
        try {
            let message = JSON.parse(_message);
            if (!message.isServerMessage) return false;

            let proxy = ProxyManager.getProxyById(message.proxyId);
            if (!proxy)
            {
                this.send(JSON.stringify({isServerMessage: true, type: "ProxyStatus", data: "Could not find proxy with id " + message.proxyId}));
                return; 
            } else this.enabled = proxy.enableClient(this, message);
        } catch (e) {console.log('an error accured', e)}
    }

    this.send = function(_str) {
        this.connection.send(_str);
    }

    this.remove = function() {
        if (this.proxy)
        {
            this.proxy.disconnectClient(this);
        }
        Clients.removeClient(this.id);
    }


    function generateKey() {
        return Math.round(Math.random() * Math.pow(10, KEY_LENGTH));
    }
}



function _Proxy({id}) {
    this.id = id;
    this.key = 'client here';

    this.clients = [];

    this.send = function(_client, _message) {
        for (let client of this.clients)
        {
            if (client.id == _client.id) continue;
            console.log('[Proxy] Send message from ' + _client.id + ' to ' + client.id, _message);
            client.send(_message);
        }
    }

    this.enableClient = function(_client, _message) {
        if (_message.key != this.key) 
        {
            _client.send(JSON.stringify({isServerMessage: true, type: "ProxyConnect", proxyId: this.id, data: "Failed to connected to proxy"}));;
            return true;
        }
        console.log("[Proxy] Enabled client " + _client.id + " in proxy " + this.id);
        _client.proxy = this;
        this.clients.push(_client);
        _client.send(JSON.stringify({isServerMessage: true, type: "ProxyConnect", proxyId: this.id, data: "Successfully connected to proxy"}));
        return true;
    }

    this.disconnectClient = function(_client) {
        for (let i = 0; i < this.clients.length; i++)
        {
            if (this.clients[i].id == _client)
            {
                this.splice(i, 1);
                console.log('Disconnected client ' + this.clients[i].id + " from proxy " + this.id);
                return true;
            }
        }
        return false;
    }
}













function newId() {return parseInt(Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000));}
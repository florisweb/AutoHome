
import { Subscriber, Service } from '../serviceLib.js';
import { Client } from '../client.js';
import WebSocket from 'ws';

function CustomSubscriber() {
    Subscriber.call(this, ...arguments);
}


export default function() {
    const This = this;
    Service.call(this, {
        id: 'ProxyManager',
        SubscriberTemplate: CustomSubscriber
    });

    let Socket;

    this.setup = async function() {
        this.connect();
    }
    
    this.clientSets = [];

    let proxyClientEnabled = false;
    this.isConnected = function() {
        return Socket && Socket.readyState == 1 && proxyClientEnabled;
    }

    this.connect = function() {
        Socket = new WebSocket('wss://thuiswolk.ga:8081');
        proxyClientEnabled = false;

        Socket.on('open', function() {
            console.log('[ProxyManager] Connected');
            Socket.send(JSON.stringify({
                isProxyServerMessage:   true, 
                proxyId:                This.config.proxyId,
                key:                    This.config.proxyKey,
                createProxyKey:         This.config.createProxyKey
            }));
            let client = new Client(Socket);
        });

        Socket.on('close', function() {
            console.log('[ProxyManager] Disconnected');
            setTimeout(() => {
                console.log('[ProxyManager] Reconnecting...');
                This.connect();
            }, 30 * 1000);
        });
        Socket.on('error', function() {console.log('error', ...arguments)});

        Socket.on('message', function(_data) {
            let message;
            try {
                message = JSON.parse(_data.toString());
            } catch (e) {return;}
            if (!message.isProxyServerMessage) return handleProxyMessage(message);

            switch (message.type)
            {
                case 'clientConnect': 
                    let conn = new ProxyClientConn(Socket, message.data, This);
                    This.clientSets.push({
                        client: new Client(conn),
                        conn: conn,
                    });

                    console.log('[ProxyManager] Add clientSet ', message.data, "total: ", This.clientSets.length);
                break;
                case 'clientDisconnect': 
                    let proxyClient = This.clientSets.find((_set) => _set.conn.proxyClientId == message.data);
                    if (!proxyClient) return;
                    proxyClient.conn.close();
                    console.log('[ProxyManager] Remove clientSet ', message.data, "total: ", This.clientSets.length);
                break;
                case "CreateProxy":
                    proxyClientEnabled = true;
                    console.log('[ProxyManager] Enabled proxy-connection.');
                break;
                default: 
                    console.log('[ProxyManager] Message', message);
                break;
            }

        });

        function handleProxyMessage(_message) {
            let proxyClient = This.clientSets.find((_set) => _set.conn.proxyClientId == _message.senderProxyClientId);
            if (!proxyClient) return console.log('cant find client');
            proxyClient.conn.onMessage(JSON.stringify(_message));
        }
    }
}



function ProxyClientConn(_socket, _clientId, _proxyManager) {
    const ProxyManager = _proxyManager;

    this.proxyClientId = _clientId;
    this.onMessage  = () => {};
    this.onEnd      = () => {};
    this.onClose    = () => {};
    this.onPong     = () => {};

    this.on = function(_type, _callback) {
        switch (_type)
        {
            case 'message':     this.onMessage  = _callback; break;
            case 'end':         this.onEnd      = _callback; break;
            case 'close':       this.onClose    = _callback; break;
            case 'pong':        this.onPong     = _callback; break;
            default: break;
        }
    }

    this.send = function(_string) {
        let message;
        try {
            message = JSON.parse(_string);
        } catch (e) {return;}
        message.targetProxyClientId = this.proxyClientId;
        _socket.send(JSON.stringify(message));
    }

    this.close = function() {
        ProxyManager.clientSets = ProxyManager.clientSets.filter((_set) => _set.conn.proxyClientId != this.proxyClientId);
        _socket.send(JSON.stringify({ // Disconnect client from proxy - TODO: to be implemented 
            isProxyServerMessage: true,
            type: "disconnectClient",
            data: this.proxyClientId
        }));

        this.onEnd();
        this.onClose();
    }
    this.terminate = function() {this.close();}

    this.ping = function() { // TODO: Ping the actual client
        if (this.onPong) this.onPong();
    }
}








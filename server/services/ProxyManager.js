
import { Subscriber, Service } from '../serviceLib.js';
import Client from '../client.js';
import WebSocket from 'ws';

function CustomSubscriber() {
    Subscriber.call(this, ...arguments);
}


export default new function() {
    const This = this;
    Service.call(this, {
        id: 'ProxyManager',
        SubscriberTemplate: CustomSubscriber
    });

    let Socket;

    this.setup = async function() {
        this.connect();
    }

    this.connect = function() {
        Socket = new WebSocket('wss://thuiswolk.ga:8081');

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
        Socket.on('error', function() {});

        Socket.on('message', function(data) {
            console.log('[ProxyManager] Message', data.toString());
        });
    }
}










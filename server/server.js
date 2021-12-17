import WebServer from './webServer.js';
import ServiceManager from './services/serviceManager.js';
import { InterfaceClient, authenticateInterfaceClient } from './interfaceClient.js';

import { WebSocketServer } from 'ws';
const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });
console.log("The WebSocket server is running on port " + PORT);

let clients = [];
wss.on("connection", _conn => {
    let client = new Client(_conn);
    clients.push(client);
    console.log('[Client connected] Total: ' + clients.length);
});









function Client(_conn) {
    const This = this;
    this.authenticated = false;
    this.service;
    this.id = newId();

    const Conn = _conn;
    Conn.on("message", buffer => {
        if (This.isInterfaceClient) return;
        
        let data;
        try {
            data = JSON.parse(buffer);
        } catch (e) {return Conn.send(JSON.stringify({error: "Invalid request"}))};

        if (This.authenticated) return This.service.onMessage(data);

        if (!data.id) return Conn.send(JSON.stringify({error: "Parameters missing"}));
        if (data.id == "InterfaceClient")
        {
            if (!authenticateInterfaceClient(data.key))
            {
                console.log('[Invalid key] InterfaceClient ' + This.id + " tried to connect with an invalid key.");
                Conn.send(JSON.stringify({"error": "Invalid Key"}));
                Conn.close();
                return;
            }

            InterfaceClient.call(This, Conn);  
            return;
        }

        let service = ServiceManager.getService(data.id);
        if (!service) return Conn.send(JSON.stringify({error: "Service not found"}));
        let allowed = service.authenticate(data.key);
        if (!allowed) return Conn.send(JSON.stringify({error: "Invalid Key"}));
        This.authenticated = true;
        This.service = service;
        This.service.client = This;
        Conn.send(JSON.stringify({type: "auth", data: true}));
        console.log('Bound Client ' + This.id + ' to service ' + This.service.id);
    });


    Conn.on("close", () => {
        clients = clients.filter(s => s.id !== This.id);
        if (This.service) This.service.client = false;
        console.log('[Client disconnected] Total: ' + clients.length);
    });

    Conn.onerror = function () {
        console.log("Some Error occurred")
    }


    this.send = (_string) => {
        Conn.send(_string);
    }   
}





let newId = () => {return Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000);}
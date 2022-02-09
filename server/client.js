import ServiceManager from './serviceManager.js';
import { InterfaceClient, authenticateInterfaceClient } from './interfaceClient.js';

export let clients = [];
export function Client(_conn) {
    clients.push(this);
    console.log('[Client connected] Total: ' + clients.length);

    const This = this;
    this.authenticated = false;
    this.service;
    this.id = newId();

    const Conn = _conn;
    this.conn = _conn;
    
    this.isAlive = true;
    Conn.on('pong', () => {
        This.isAlive = true;
        if (This.service) This.service.setDevicesClient(This);
    });

    Conn.on("close", () => {
        clients = clients.filter((client) => client.id != This.id);
        if (This.service) This.service.setDevicesClient(false);
        console.log('[Client disconnected] ' + This.id + ' Total: ' + clients.length);
    });

    Conn.on("message", buffer => {
        if (This.isInterfaceClient) return;
        
        let data;
        try {
            data = JSON.parse(buffer);
        } catch (e) {return Conn.send(JSON.stringify({error: "Invalid request"}))};
        
        if (data.isProxyServerMessage) return;
        if (This.authenticated) return This.service.onMessage(data);


        if (!data.id) return Conn.send(JSON.stringify({error: "Parameters missing"}));
        if (data.id == "InterfaceClient")
        {
            if (!authenticateInterfaceClient(data.key))
            {
                console.log('[Invalid key] InterfaceClient ' + This.id + " tried to connect with an invalid key.");
                Conn.send(JSON.stringify({"type": "auth", "status": false, "error": "Invalid Key"}));
                Conn.close();
                return;
            }

            InterfaceClient.call(This, Conn);  
            Conn.send(JSON.stringify({"type": "auth", "status": true}));
            return;
        }

        let service = ServiceManager.getService(data.id);
        if (!service) return Conn.send(JSON.stringify({error: "Service not found"}));
        if (!service.config.isDeviceService) return Conn.send(JSON.stringify({error: "Service is not a deviceService"}));
        
        let allowed = service.authenticate(data.key);
        if (!allowed) return Conn.send(JSON.stringify({error: "Invalid Key"}));
        
        This.authenticated = true;
        This.service = service;
        Conn.send(JSON.stringify({type: "auth", data: true}));
        service.setDevicesClient(This);
        console.log('Bound Client ' + This.id + ' to service ' + This.service.id);
    });

    Conn.on("error", () => {
        console.log("Some Error occurred");
    });
    Conn.on("timeout", () => {
        console.log("timeout");
    });
    Conn.on("end", () => {
        console.log("end");
    });


    this.send = (_string) => {
        Conn.send(_string);
    }
}



let newId = () => {return Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000);}
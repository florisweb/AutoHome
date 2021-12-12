
const WebSocketServer = require('ws');
const PORT = 8080;


const CableLamp = new (require('./cableLamp.js').constructor)();
const Services = [
    CableLamp    
];




 
const wss = new WebSocketServer.WebSocketServer({ port: PORT });
console.log("The WebSocket server is running on port " + PORT);



const ServiceManager = new function() {
    this.findService = function(_id) {
        return Services.find((s) => s.id == _id);
    }
}




let clients = [];
wss.on("connection", _conn => {
    let client = Client(_conn);
    clients.push(client);
    console.log('[Client connected] Total: ' + clients.length);
});


function Client(_conn) {
    const This = this;
    this.authenticated = false;
    this.service;
    let Conn = _conn;
    
    Conn.send('hey there! from server');
    Conn.on("message", buffer => {
        let data;
        try {
            data = JSON.parse(buffer);
        } catch (e) {return Conn.send(JSON.stringify({error: "Invalid request"}))};

        if (!This.authenticated)
        {
            if (!data.id || !data.key) return Conn.send(JSON.stringify({error: "Parameters missing"}));
            let service = ServiceManager.findService(data.id);
            if (!service) return Conn.send(JSON.stringify({error: "Service not found"}));
            let allowed = service.authenticate(data.key);
            if (!allowed) return Conn.send(JSON.stringify({error: "Invalid Key"}));
            This.authenticated = true;
            This.service = service;
            Conn.send(JSON.stringify({type: "auth", data: true}));
            console.log('bound client to service', This.service.id, This);

            return;
        }


        setTimeout(() => {Conn.send(JSON.stringify(data));}, 1000);
    });

    Conn.on("close", () => {
        console.log("the client has connected");
        clients = clients.filter(s => s !== Conn);
    });

    Conn.onerror = function () {
        console.log("Some Error occurred")
    }
}










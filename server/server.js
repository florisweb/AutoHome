
const WebSocketServer = require('ws');
const PORT = 8080;


const CableLamp = new (require('./cableLamp.js').constructor)();
const Services = [
    CableLamp,
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

        if (!This.authenticated)
        {
            if (!data.id) return Conn.send(JSON.stringify({error: "Parameters missing"}));
            if (data.id == "InterfaceClient")
            {
                InterfaceClient.call(This, Conn);  
                return;
            }

            let service = ServiceManager.findService(data.id);
            if (!service) return Conn.send(JSON.stringify({error: "Service not found"}));
            let allowed = service.authenticate(data.key);
            if (!allowed) return Conn.send(JSON.stringify({error: "Invalid Key"}));
            This.authenticated = true;
            This.service = service;
            This.service.client = This;
            Conn.send(JSON.stringify({type: "auth", data: true}));
            console.log('Bound Client ' + This.id + ' to service ' + This.service.id);

            return;
        }

        This.service.onMessage(data);
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



function InterfaceClient(_conn) {
    const This = this;
    const Conn = _conn;
    this.isInterfaceClient = true;
    console.log('Upgraded client ' + this.id + ' to InterfaceClient');

    this.subscriptions = new SubscriptionList([
        CableLamp.subscribe({onEvent: handleCableLampEvent})
    ]);

    function handleCableLampEvent(_event) {
        Conn.send(JSON.stringify(_event));
    }



    Conn.on("message", buffer => {
        let message;
        try {
            message = JSON.parse(buffer);
        } catch (e) {return Conn.send(JSON.stringify({error: "Invalid request"}))};

        console.log('interfaceclient request', This.id, message);

        let subscription = This.subscriptions.get(message.serviceId);
        if (!subscription) return Conn.send(JSON.stringify({error: "Subscription not found"}));

        console.log(
            "Subsciber of service " + subscription.service.id + ".handleRequest()", 
            message, 
            subscription.handleRequest(message)
        );
    });
}


function SubscriptionList(_list = []) {
    _list.get = (_id) => {
        return _list.find((sub) => {return sub.service.id == _id});
    }
    return _list;
}







let newId = () => {return Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000);}





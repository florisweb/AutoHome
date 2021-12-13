const ServiceLib = require('./serviceLib.js');
/*
    Messages:
    type:
        lampSatus -> data: lampOn



*/

function Subscriber() {
    ServiceLib.Subscriber.call(this, ...arguments);

    this.handleRequest = function(_message) {
        switch (_message.type) 
        {
            case "setLampStatus": 
                return this.service.send({
                    type: 1,
                    data: _message.data
                });
            case "runLightProgram": 
                return this.service.send({
                    type: 2,
                });
            case "setTimerStart": 
                return this.service.send({
                    type: 3,
                    data: _message.data
                });
        }
    }
}


exports.service = new function() {
    ServiceLib.DeviceService.call(this, {
        id: 'CableLamp',
        SubscriberTemplate: Subscriber
    });

    this.onMessage = function(_message) {
        console.log(this.id + " received: ", _message);
        this.pushEvent(_message);
    }
}











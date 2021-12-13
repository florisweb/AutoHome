const Service = require('./service.js');
/*
    Messages:
    type:
        lampSatus -> data: lampOn



*/

function Subscriber() {
    Service.Subscriber.call(this, ...arguments);

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


exports.constructor = function() {
    Service.DeviceService.call(this, {
        id: 'CableLamp',
        SubscriberTemplate: Subscriber
    });

    this.onMessage = function(_message) {
        console.log(this.id + " received: ", _message);
        switch (_message.type)
        {
            case "lampStatus": this.pushEvent(_message); break;
        }
    }
}











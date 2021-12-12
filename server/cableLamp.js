let Service = require('./service.js');



/*
    Messages:
    type:
        lampSatus -> data: lampOn



*/

function CableLamp() {
    Service.DeviceService.call(this, {
        id: 'CableLamp',
    });

    this.onMessage = function(_message) {
        switch (_message.type)
        {
            case "lampStatus": this.pushEvent(_message); break;
        }
    }

    this.setLampStatus = function(_lampOn = false) {
        return this.send({
            type: 1,
            data: _lampOn
        });
    }

     this.runLightProgram = function() {
        return this.send({
            type: 2,
        });
    }
    this.setTimerStart = function(_timeString) {
        return this.send({
            type: 3,
            data: _timeString
        });
    }
}

exports.constructor = CableLamp;

import { Subscriber, DeviceService } from './serviceLib.js';

function CustomSubscriber() {
    Subscriber.call(this, ...arguments);

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
            case "setLightProgram": 
                return this.service.send({
                    type: 4,
                    data: _message.data
                });
        }
    }
}

export default new function() {
    const This = this;
    DeviceService.call(this, {
        id: 'CableLamp',
        SubscriberTemplate: CustomSubscriber,
        onMessage: onMessage
    });

    function onMessage(_message) {
        switch (_message.type)
        {
            case "lampStatus": This.curState.lampOn = _message.data; break;
        }
        console.log(This.id + " received: ", _message);
        This.pushEvent(_message);
    }
}











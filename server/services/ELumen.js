
import { Subscriber, DeviceService } from './serviceLib.js';

function CustomSubscriber() {
    Subscriber.call(this, ...arguments);

    const commandIndicesByName = {
        giveWater: 1,
        calibrate: 2,
    };

    this.handleRequest = function(_message) {
        console.log('ELumensubscriber.handleRequest', _message);
        let index = commandIndicesByName[_message.type];
        if (index) return this.service.send({type: index, data: _message.data});
    }
}

export default new function() {
    const This = this;
    DeviceService.call(this, {
        id: 'ELumen',
        SubscriberTemplate: CustomSubscriber,
        onMessage: onMessage
    });

    function onMessage(_message) {
        console.log('ELumen.onMessage', _message);
        This.pushEvent(_message);
    }


    this.onDeviceConnect = () => {
    }
}











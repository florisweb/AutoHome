
import { Subscriber, DeviceService } from './serviceLib.js';

function CustomSubscriber() {
    Subscriber.call(this, ...arguments);

    this.handleRequest = function(_message) {
       console.log('ELumensubscriber.handleRequest', _message);
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











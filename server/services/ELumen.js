
import { Subscriber, DeviceService } from './serviceLib.js';

function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

    const commandIndicesByName = {
        giveWater: 1,
        calibrate: 2,
    };

    function handleRequest(_message) {
        console.log('ELumensubscriber.handleRequest', _message);
        let index = commandIndicesByName[_message.type];
        if (index) return This.service.send({type: index, data: _message.data});
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











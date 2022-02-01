
import { Subscriber, DeviceService, ServiceFileManager } from './serviceLib.js';

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

    this.dataManager = new function() {
        let fm = new ServiceFileManager({path: "data.json", defaultValue: []}, This);
        this.addDataRow = async function(_data) {
            let data = await fm.getContent();
            data.push({time: Date.now(), data: _data});
            return fm.writeContent(data);
        }
    }


    function onMessage(_message) {
        console.log('ELumen.onMessage', _message);
        switch (_message.type)
        {
            case "sensorState": This.dataManager.addDataRow(_message.data); break;
        }
        
        This.pushEvent(_message);
    }


    this.onDeviceConnect = () => {
    }
}











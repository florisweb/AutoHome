
import { Subscriber, DeviceService, ServiceFileManager } from '../serviceLib.js';

function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

    async function handleRequest(_message) {
        console.log('ELumensubscriber.handleRequest', _message);

        // Server intercepted messages
        switch (_message.type)
        {
            case "getData": 
                return This.onEvent({type: "data", data: await This.service.dataManager.getData()});
        }
        
        // Default messages
        return This.service.send(_message);
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
        this.getData = function() {
            return fm.getContent();
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











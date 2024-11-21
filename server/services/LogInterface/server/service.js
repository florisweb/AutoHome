
import { Subscriber, Service } from '../../../serviceLib.js';
import Logger from '../../../logger.js';


function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

    async function handleRequest(_message) {
        // Server intercepted messages
        switch (_message.type)
        {
            case "getLogs": 
                return This.onEvent({type: "data", data: await This.service.getLogs()});
        }
        // Default messages
        return This.service.send(_message);
    }
}


export default class extends Service {
    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
        Logger.registerOnLogHook(async () => {
            this.pushEvent({
                type: "data",
                data: await this.getLogs()
            });
        });
    }

    async getLogs() {
        return await Logger.getLogs();
    }
}











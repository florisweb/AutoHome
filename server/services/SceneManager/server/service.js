import { Service, ServiceState, Subscriber } from '../../../serviceLib.js';
import { importScenes } from './sceneLib.js';


function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    async function handleRequest(_message) {
        switch (_message.type)
        {
            case "activateScene": return This.service.activateScene(_message.data);
            case "getScenes": 
                if (!_message.isRequestMessage) return;
                let sceneIds = Object.keys(This.service.scenes);
                return _message.respond({
                    type: 'scenes',
                    data: sceneIds.map(id => {return {name: This.service.scenes[id].name, id: id}})
                });
        }
    }
}

export default class extends Service {
    curState = new (class extends ServiceState{
        #service;
        constructor(_service) {
            super();
            this.#service = _service;
        }

        export() {
            let data = super.export();
            data.curSceneId = this.#service.getCurSceneId();
            return data;
        }
    })(this)

    scenes = {};
    constructor(_config) {
        super(_config, CustomSubscriber);
    }


    async setup() {
        this.scenes = await importScenes();
    }

    getCurSceneId() {
        for (let sceneId in this.scenes)
        {
            if (this.scenes[sceneId].enabled && this.scenes[sceneId].isActive()) return sceneId;
        }
        return false;
    }



    onLoadRequiredServices(_services) {
        for (let serviceId in _services)
        {
            _services[serviceId].subscribe({
                onEvent: (_event) => this.onSubscriptionEvent(serviceId, _event)
            });
        }

        for (let sceneId in this.scenes)
        {
            let error = this.scenes[sceneId].enable(_services);
            if (error) console.log('[SceneManager] Error, can\'t activate Scene:', sceneId, error);
        }  
    }

    #prevSceneId;
    onSubscriptionEvent(_serviceId, _event) {
        console.log('sub-event', _serviceId, _event.type);
        let curSceneId = this.getCurSceneId();
        if (curSceneId === this.#prevSceneId) return;
        this.#prevSceneId = curSceneId;
        this.pushCurState();
    }

    activateScene(_sceneId, _params) {
        if (!this.scenes[_sceneId]) return;
        this.scenes[_sceneId].activate(_params);
        this.pushCurState();
    }
}











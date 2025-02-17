import { Service, ServiceState, Subscriber } from '../../../serviceLib.js';
import { importScenes } from './sceneLib.js';
import Logger from '../../../logger.js';

function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    async function handleRequest(_message) {
        switch (_message.type)
        {
            case "activateScene": return This.service.activateScene(_message.data, true);
            case "getScenes": 
                if (!_message.isRequestMessage) return;
                let sceneIds = Object.keys(This.service.scenes);
                return _message.respond({
                    type: 'scenes',
                    data: sceneIds.filter(id => !This.service.scenes[id].hiddenInUI).map(id => {return {name: This.service.scenes[id].name, id: id}})
                });
        }
    }
}

export default class extends Service {
    curState = new (class extends ServiceState {
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
            if (error) Logger.log('Error, can\'t activate Scene:' + sceneId, error, 'SCENEMANAGER');
        }  
    }

    #prevSceneId;
    onSubscriptionEvent(_serviceId, _event) {
        let curSceneId = this.getCurSceneId();
        let curScene = this.scenes[curSceneId];
        if (curScene && curScene.isDynamicScene) curScene.onEvent(_event, _serviceId);

        if (curSceneId === this.#prevSceneId) return;
        this.#prevSceneId = curSceneId;
        this.pushCurState();
    }

    activateScene(_sceneId, _params) {
        for (let key in this.scenes) if (this.scenes[key].isDynamicScene && key !== _sceneId) this.scenes[key].running = false;
        Logger.log(`Set scene to ${_sceneId}`, null, 'SCENEMANAGER');
        if (!this.scenes[_sceneId]) return;
        this.scenes[_sceneId].activate(_params);
        this.pushCurState();
    }
}











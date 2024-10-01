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
            data.curSceneId = this.curSceneId;
            return data;
        }

        get curSceneId() {
            for (let sceneId in this.#service.scenes)
            {
                if (this.#service.scenes[sceneId].isActive()) return sceneId;
            }
            return false;
        }
    })(this)

    scenes = {};
    constructor(_config) {
        super(_config, CustomSubscriber);
    }


    async setup() {
        this.scenes = await importScenes();
    }



    onLoadRequiredServices(_services) {
        for (let sceneId in this.scenes)
        {
            let error = this.scenes[sceneId].enable(_services);
            if (error) console.log('[SceneManager] Error, can\'t activate Scene:', sceneId, error);
        }  
    }

    activateScene(_sceneId, _params) {
        if (!this.scenes[_sceneId]) return;
        this.scenes[_sceneId].activate(_params);
        this.pushCurState();
    }
}











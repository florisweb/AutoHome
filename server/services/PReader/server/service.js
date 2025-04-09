import { Subscriber, SubscriptionList, DeviceService, DeviceServiceState, ServiceFileManager } from '../../../serviceLib.js';
import Logger from '../../../logger.js';

import MusicManager from './musicManager.js';

let curImageData;

function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    async function handleRequest(_message) {

        switch (_message.type) 
        {
            case "getMusic": 
                _message.respond(await MusicManager.getAvailableMusic());
                break;
        }
      

        return This.service.send(_message);
    }
}

export default class extends DeviceService {
    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
    }
    curState = new DeviceServiceState({
        availableMusic: []
    }, this);

    #requestTimeoutDuration = 1000 * 60 * 5;
    #curRequestedMusicImages = [];

    async setup() {
        MusicManager.onAvailableMusicChange = async () => {
            this.curState.availableMusic = await MusicManager.getAvailableMusic();
            this.pushCurState();
        }
        this.curState.availableMusic = await MusicManager.getAvailableMusic();
    }

    onMessage(_message) {
        super.onMessage(_message);
        console.log('got message', _message.type, _message.data);

        if (_message.isRequestMessage) return this.#handleRequests(_message);


        console.log('push event message', _message);
        this.pushEvent(_message);
    }

    #handleRequests(_message) {
        switch (_message.type)
        {
            case "requestMusicImage": 
                return this.#handleRequestMusicImage(_message);
            case "getImageSection":
                return this.#handleRequestImageSection(_message);
        }
    }

    async #handleRequestMusicImage(_message) {
        // Remove timed out requests
        this.#curRequestedMusicImages = this.#curRequestedMusicImages.filter(r => new Date() - r.startTime < this.#requestTimeoutDuration);


        let pages = await MusicManager.getAvailableMusicPages();
        let requestedPage = `${_message.data.musicName}_[${_message.data.pageIndex}]`;
        console.log('available pages', pages, 'requested', requestedPage);
        if (!pages.includes(requestedPage)) return _message.respond({error: 'E_PageNotFound'});

        let data = await MusicManager.getMusicImage(requestedPage);


        let request = {
            musicName: _message.data.musicName,
            pageIndex: _message.data.pageIndex,
            dataString: data,
            startTime: new Date(),
            id: parseInt(newId().substr(0, 5))
        }
        this.#curRequestedMusicImages.push(request);

        _message.respond({
            dataLength: data.length,
            imageWidth: 968,
            imageRequestId: request.id
        });
    }


    #handleRequestImageSection(_message) {
        let request = this.#curRequestedMusicImages.find((req) => req.id === _message.data.imageRequestId);
        if (!request) return _message.respond({error: 'E_requestNotFound'});

        let startPos = _message.data.startIndex;
        let sectionLength = _message.data.sectionLength;
                
        if (startPos + sectionLength >= request.dataString.length) 
        {
            this.#curRequestedMusicImages = this.#curRequestedMusicImages.filter(r => r.id !== _message.data.imageRequestId);
            console.log('all image data has been requested');
        }

        console.log('getImageSection: respond with:', request.dataString.substr(startPos, sectionLength))
        _message.respond({
            startIndex: startPos,
            data: request.dataString.substr(startPos, sectionLength)
        });
    }
}




let newId = () => {return Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000);}
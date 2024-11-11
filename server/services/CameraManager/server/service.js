import { URL } from 'url';
import fs from 'fs';
import { readdirSync } from 'fs'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import busboy from 'busboy';

import WebServer from '../../../webServer.js';

import { Subscriber, Service, ServiceFileManager } from '../../../serviceLib.js';




const __dirname = getCurDir();
const dataStoragePath = __dirname + '/../../../DBData/CameraManager_images';

export function getCurDir() {
    return dirname(fileURLToPath(import.meta.url));
}



function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    this.acceptorService = _config.acceptorService

    async function handleRequest(_message) {

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


export default class extends Service {
    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
        WebServer.registerEndPoint('/CameraManager/upload', async (_request, _response) => {
            let path = dataStoragePath + '/' + (new Date().getTime()) + '.jpeg';

            const bb = busboy({ headers: _request.headers });
            bb.on('file', (name, file, info) => file.pipe(fs.createWriteStream(path)));
            bb.on('close', () => {
                _response.writeHead(200, { 'Content-Type': 'text/plain' });
                _response.end(`upload success`);
                this.pushEvent({type: 'newImageUploaded'});
            });
            _request.pipe(bb);
        });

        WebServer.registerEndPoint('/CameraManager/latestImage', async (_request, _response) => {
            let latestImage = this.#getLatestImagePath();
            if (!latestImage) return _response.sendStatus(400);
            let path = new URL(dataStoragePath + '/' + latestImage, import.meta.url).pathname;
            _response.sendFile(path);
        });
    }

    #getLatestImagePath() {
        let paths = readdirSync(dataStoragePath, { withFileTypes: true })
            .filter(dirent => !dirent.isDirectory() && !dirent.name.includes(".DS_Store"))
            .map(dirent => dirent.name);
        let timeStamps = paths.map(r => parseInt(r.substr(0, r.length - 5)));
        timeStamps.sort((a, b) => a > b);

        if (!timeStamps.length) return false;
        return timeStamps[timeStamps.length - 1] + '.jpeg';
    }
}











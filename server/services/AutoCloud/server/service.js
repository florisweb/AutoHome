import fs from 'fs';
import path from 'path';
import { readdir, stat } from 'fs/promises';

import { FileManager } from '../../../DBManager.js';
import { Subscriber, SubscriptionList, Service, ServiceState } from '../../../serviceLib.js';
import Logger from '../../../logger.js';

function CustomSubscriber(_config) {
    Subscriber.call(this, {..._config, handleRequest: handleRequest});
    const This = this;
    async function handleRequest(_message) {
        return This.service.send(_message);
    }
}

export default class extends Service {
    #curStatePath;
    #FM;

    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
        this.#curStatePath = this.config.storageFolder + '/curState.json';
        this.#FM = new FileManager(this.#curStatePath, {isAbsolutePath: true});
    }   
    curState = new ServiceState({
        folders: [],
        lastChange: 0,
        lastSync: 0,
    }, this);


    async setup() {
        let singleEventCatcher;
        fs.watch(this.#curStatePath, {}, async (eventType, relativePath) => {
            if (singleEventCatcher) return;
            singleEventCatcher = wait(2000);
            await singleEventCatcher;
            singleEventCatcher = false;

            try {
                this.#updateState();
            } catch (e) {Logger.log('Error while updating state: ' + e, 'AUTOCLOUD')}
        });
        this.#updateState();
    }

    async #updateState() {
        let contents = await this.#FM.getContent();

        if (!contents) 
        {
            this.curState.folders = [];
            this.curState.lastChange = 0;
            this.curState.lastSync = 0;
            return this.pushCurState();
        }

        this.curState.lastChange = contents.lastChange;
        this.curState.lastSync = contents.lastSync;
        this.curState.folders = [];
        for (let folder of contents.trackedFolders)
        {
            this.curState.folders.push({
                clientPath: folder.clientPath,
                serverPath: folder.serverPath,
                size: await getDirSize(this.config.storageFolder + '/' + folder.serverPath)
            })
        };

        return this.pushCurState();
    }
}








const getDirSize = async (dirPath) => {
    let size = 0;
    try {
        let files = await readdir(dirPath)
        for (let i = 0; i < files.length; i++) {
            const filePath = path.join(dirPath, files[i]);
            const stats = await stat(filePath);

            if (stats.isFile()) {
                size += stats.size;
            } else if (stats.isDirectory()) {
                size += await getDirSize(filePath);
            }
        }
    } catch (e) {
        return size;
    }

    return size;
};

function wait(_ms) {
    return new Promise((resolve) => setTimeout(resolve, _ms));
}
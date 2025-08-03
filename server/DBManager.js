import fs from 'fs';
import { getCurDir } from './polyfill.js';

const __dirname = getCurDir();
const dataStoragePath = __dirname + '/DBData';


let curRequestPromise;

export class FileManager {
    _path;
    _absolutePath;
    #createFileIfNotPresent;
    constructor(_path, {createFileIfNotPresent, isAbsolutePath} = {createFileIfNotPresent: true, isAbsolutePath: false}) {
        this._path = _path;
        this._absolutePath = isAbsolutePath ? _path : __dirname + '/' + this._path;
        this.#createFileIfNotPresent = createFileIfNotPresent;
    }
    
    async getContent(_isJSON = true) {
        return this.#queueFunc(() => 
            new Promise((resolve, error) => {
                fs.readFile(this._absolutePath, (err, content) => {
                    if (err) 
                    {
                        if (err.code === 'ENOENT' && this.#createFileIfNotPresent) return resolve();
                        return error(err);
                    }
                    let parsedContent = content;
                    if (!_isJSON) return resolve(content);
                    try {
                        parsedContent = JSON.parse(String(content));
                    } catch (e) {console.log('[FileManager]: Invalid json content: (' + this._absolutePath + ')', e, this._absolutePath, content)};
                    resolve(parsedContent);
                });
            })
        );
    }

    async fileExists() {
        return this.#queueFunc(() => 
            new Promise((resolve, error) => {
                fs.exists(this._absolutePath, (_result) => resolve(_result));
            })
        );
    }

    async writeContent(_contentObj) {
        return this.#queueFunc(() => 
            new Promise((resolve, error) => {
                let string = JSON.stringify(_contentObj);
                fs.writeFile(this._absolutePath, string, (err) => {
                    if (err) return error(err);
                    resolve(true);
                });
            })
        );
    }


    async #queueFunc(_func) {
        while (curRequestPromise) await curRequestPromise;

        curRequestPromise = _func();

        return new Promise((resolve, error) => {
            curRequestPromise.then((_res) => {
                resolve(_res);
                curRequestPromise = false;
            }, (_error) => {
                error(_error);
                curRequestPromise = false;
            });
        });
    }
}

export class DBFileManager extends FileManager { 
     constructor(_path, {createFileIfNotPresent, isAbsolutePath} = {createFileIfNotPresent: true, isAbsolutePath: false}) {
        super();
        this._absolutePath = isAbsolutePath ? _path : dataStoragePath + '/' + _path;
    }
}
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';


const __dirname = getCurDir();
const dataStoragePath = __dirname + '/DBData';

export function getCurDir() {
    return dirname(fileURLToPath(import.meta.url));
}

const DBManager = new function() {
    this.FileManager = FileManager;
}
export default DBManager;

export function FileManager(_path) {
    const Path = _path;
    let ActualPath = dataStoragePath + '/' + Path;

    this.getContent = async function(_isJSON = true) {
        return new Promise((resolve, error) => {
            fs.readFile(ActualPath, (err, content) => {
                if (err) return error(err);
                let parsedContent = content;
                if (!_isJSON) return resolve(content);
                try {
                    parsedContent = JSON.parse(content);
                } catch (e) {console.log('[FileManager]: Invalid json content: (' + ActualPath + ')', e, ActualPath)};
                resolve(parsedContent);
            });
        });
    }

    this.fileExists = async () => {
        return new Promise((resolve, error) => {
            fs.exists(ActualPath, (_result) => resolve(_result));
        });
    }

    let writingPromise;
    this.writeContent = async function(_contentObj) {
        while (writingPromise) await writingPromise;

        writingPromise = new Promise((resolve, error) => {
            let string = JSON.stringify(_contentObj);
            fs.writeFile(ActualPath, string, (err) => {
                writingPromise = false;
                if (err) return error(err);
                resolve(true);
            });
        });
        return writingPromise;
    }
}
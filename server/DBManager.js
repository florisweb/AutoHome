import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataStoragePath = __dirname + '/DBData';

const DBManager = new function() {
    this.FileManager = FileManager;
}
export default DBManager;

export function FileManager(_path) {
    const Path = _path;
    let ActualPath = dataStoragePath + '/' + Path;

    this.getContent = async function() {
        return new Promise((resolve, error) => {
            fs.readFile(ActualPath, (err, content) => {
                if (err) return error(err);
                let parsedContent = content;
                try {
                    parsedContent = JSON.parse(content);
                } catch (e) {console.log('invalid json content', e, ActualPath)};
                resolve(parsedContent);
            });
        });
    }

    this.fileExists = async () => {
        return new Promise((resolve, error) => {
            fs.exists(ActualPath, (_result) => resolve(_result));
        });
    }

    this.writeContent = async function(_contentObj) {
        return new Promise((resolve, error) => {
            let string = JSON.stringify(_contentObj);
            fs.writeFile(ActualPath, string, (err) => {
              if (err) return error(err);
              resolve(true);
            });
        });
    }
}
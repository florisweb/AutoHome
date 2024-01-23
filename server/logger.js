import { FileManager } from './DBManager.js';



const Logger = new class {
    #fm;
    constructor() {
        this.#fm = new FileManager("log.json");
    }

    log(message, content, tag = false) {
        console.log('[LOGGER]', tag, message, content);
        return this.logLine(new LogLine({
            tag: tag,
            message: message,
            content: content
        }));
    }
    async logLine(_logLine) {
        return new Promise(async (resolve) => {
            let logs = await this.getLogs();
            logs.push(_logLine);

            this.#fm.writeContent(logs).then(
                (_result) => {resolve(_result)}, 
                () => {resolve(false)}
            );
        })
    }
    async getLogs() {
        return new Promise(async (resolve) => {
            this.#fm.getContent(true).then((_logs) => {
                if (!_logs || !Array.isArray(_logs)) return resolve([]);
                resolve(_logs.map((log) => new LogLine(log)));
            }, () => resolve([]));
        });
    }
}

export default Logger;

export class ServiceLogger {
    #service;
    constructor(_service) {
        this.#service = _service;
    }

    log(message, content) {
        let logLine = new LogLine({
            tag: this.#service.id,
            message: message,
            content: content
        });
        return Logger.logLine(logLine);
    }

    async getLogs() {
        let logs = await Logger.getLogs();
        return logs.filter((log) => log.tag === this.#service.id);
    }
}


class LogLine {
    tag = false;
    dateTime;
    content = [];
    message = '';

    get date() {
        return new Date(this.dateTime);
    }

    constructor({tag = false, dateTime, message = '', content = []}) {
        this.dateTime = dateTime || new Date().getTime();
        this.tag = tag;
        this.message = message;
        this.content = content;
    }
}




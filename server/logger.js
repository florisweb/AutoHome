import { FileManager } from './DBManager.js';



const Logger = new class {
    #fm;
    constructor() {
        this.#fm = new FileManager("log.json");
    }

    log(message, content, tag = false) {
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
            this.#fm.getContent().then((_logs) => {
                if (!_logs) return resolve([]);
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
    date;
    content = [];
    message = '';

    constructor({tag = false, date, message = '', content = []}) {
        // this.date = date ? date : new Date();
        this.tag = tag;
        this.message = message;
        this.content = content;
    }
}
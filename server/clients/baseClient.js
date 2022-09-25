import { parseMessage } from './message.js';


export let clients = [];
export class BaseClient {
    id              = newId();
    conn;
    isAlive         = true;
    isDead          = false;

    constructor(_conn) {
        this.conn = _conn;
        clients.push(this);
        console.log('[Client Connected] Total: ' + clients.length);

        this.conn.on('pong',    () => {if (!this.isDead) this._onPong()});
        this.conn.on('close',   () => {if (!this.isDead) this._onClose()});
        this.conn.on('error',   () => {if (!this.isDead) this._onClose()});
        this.conn.on('close',   () => {if (!this.isDead) this._onClose()});
        this.conn.on('end',     () => {if (!this.isDead) this._onClose()});
        this.conn.on('message', (_buffer) => {if (!this.isDead) this._onMessage(_buffer)});
    }

    _onPong() {
        this.isAlive = true;
    }
    _onClose() {
        clients = clients.filter((client) => client.id != this.id);
        this.isDead = true;
        console.log('[Client disconnected] ' + this.id + ' Total: ' + clients.length);
    }

    _onMessage(_buffer) { 
        let message = parseMessage(_buffer, this); 
        if (message === false) return this.send({error: "Invalid request"});
        return message;
    }

    send(_obj) {
        this.conn.send(JSON.stringify(_obj));
    }

    remove() { // Only handles removing all the clients traces, not actually closing the connection
        this._onClose();
    }
}




let newId = () => {return Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000);}



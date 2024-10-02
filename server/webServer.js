import express from 'express';
import { URL } from 'url';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));



const Logger = console;
const Express = express();
Express.use(express.json());
const Endpoints = [];


const WebServer = new class {
    PORT = process.env.port || 8080;
    server;
    constructor() {
        this.server = Express.listen(this.PORT, () => Logger.log('[!] Server started on port ' + this.PORT));
        Express.get('/*', this.handleRequest);
        Express.post('/*', this.handleRequest);
    }

    handleRequest(_request, _response) {
         if (_request.url == '/stop') 
        {
            Logger.log('=== Stopping server ===');
            this.server.close();
            _response.send('Stopping server...');
            return;
        }
        for (let endpoint of Endpoints)
        {
            if (_request.url !== endpoint.url) continue;
            try {
                return endpoint.onRequest(_request, _response);
            } catch (e) {
                console.log(e)
                return _response.send('An error accured while trying to handle your request to ' + _request.url + ' on ' + endpoint.url);
            }
        }

         let path = new URL('../interface/dist/' + _request.url, import.meta.url).pathname;
        _response.sendFile(path);

    }

    registerEndPoint(_url, _onRequest) {
        Endpoints.push(new EndPoint({url: _url, onRequest: _onRequest}))
    }
    registerStaticEndPoint(_url, _filePath) {
        Endpoints.push(new StaticEndPoint({url: _url, filePath: _filePath}))
    }
}



class EndPoint {
    url;

    onRequest(_request) {}
    constructor({url, onRequest}) {
        this.url = url;
        if (typeof onRequest === 'function') this.onRequest = onRequest;
    }
}

class StaticEndPoint extends EndPoint {
    filePath;
    constructor({url, filePath}) {
        super({url: url})
        this.filePath = filePath;
    }
    onRequest(_request, _response) {
        let path = new URL(this.filePath, import.meta.url).pathname;
        _response.sendFile(path);
    }
}


export default WebServer;


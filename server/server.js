import WebServer from './webServer.js';
import ServiceManager from './serviceManager.js';
import { clients } from './clients/baseClient.js';
import { UnDifferentiatedClient } from './clients/unDifferentiatedClient.js';

import Logger from './logger.js';

import fs from 'fs';
import { WebSocketServer } from 'ws';
import https from 'https';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

const PORTS = {
  IOT: 8081,
  Interface: 8082
}

const httpsServer =  https.createServer({
    key: fs.readFileSync(__dirname + "/certificates/thuiswolk.local.key.pem"),
    cert: fs.readFileSync(__dirname + "/certificates/thuiswolk.local.cer.pem"),
}).listen(PORTS.Interface)

const InterfaceWSS = new WebSocketServer({ 
  server: httpsServer
});
const IOTWSS = new WebSocketServer({ port: PORTS.IOT });

console.log("The WebSocket servers are running on ports " + JSON.stringify(PORTS));
Logger.log("The WebSocket servers are running on ports " + JSON.stringify(PORTS), null, 'SYSTEM');

IOTWSS.on("connection", _conn => {
  new UnDifferentiatedClient(_conn);
});

InterfaceWSS.on("connection", _conn => {
  new UnDifferentiatedClient(_conn);
});





// Remove disconnected clients
const interval = setInterval(function () {
  clients.forEach(function (client) {
    if (client.isAlive === false) return client.conn.terminate();
    client.isAlive = false;
    client.conn.ping();
    client.send({type: "heartbeat"});
  });
}, 10000);

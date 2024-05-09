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



console.log('test', __dirname);
const PORT = 8081;
const httpsServer =  https.createServer({
    key: fs.readFileSync(__dirname + "/certificates/key.pem"),
    cert: fs.readFileSync(__dirname + "/certificates/cert.pem"),
}).listen(PORT)


// const wss = new WebSocketServer({ port: PORT });
const wss = new WebSocketServer({ 
  server: httpsServer
});
console.log("The WebSocket server is running on port " + PORT);
Logger.log("The WebSocket server is running on port " + PORT, null, 'SYSTEM');

wss.on("connection", _conn => {
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

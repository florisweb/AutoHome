import WebServer from './webServer.js';
import ServiceManager from './serviceManager.js';
import {clients, Client} from './client.js';

import { WebSocketServer } from 'ws';
const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });
console.log("The WebSocket server is running on port " + PORT);

wss.on("connection", _conn => {
  new Client(_conn);
});

// Remove disconnected clients
const interval = setInterval(function () {
  clients.forEach(function (client) {
    if (client.isAlive === false) return client.conn.terminate();
    client.isAlive = false;
    client.conn.ping();
    client.send(JSON.stringify({type: "heartbeat"}));
  });
}, 10000);




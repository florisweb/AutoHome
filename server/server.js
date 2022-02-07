import WebServer from './webServer.js';
import ServiceManager from './serviceManager.js';
import Client from './client.js';

import { WebSocketServer } from 'ws';
const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });
console.log("The WebSocket server is running on port " + PORT);

wss.on("connection", _conn => {
    let client = new Client(_conn);

    _conn.on("close", () => {
        if (client.service) client.service.setDevicesClient(false);
        console.log('[Client disconnected] Total: ' + wss.clients.size);
    });
    console.log('[Client connected] Total: ' + wss.clients.size);
});

// Remove disconnected clients
const interval = setInterval(function () {
  wss.clients.forEach(function (conn) {
    if (conn.isAlive === false) return conn.terminate();
    conn.isAlive = false;
    conn.ping();
  });
}, 10000);


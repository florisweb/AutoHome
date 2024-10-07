import WebServer from './webServer.js';
import { clients } from './clients/baseClient.js';
import { UnDifferentiatedClient } from './clients/unDifferentiatedClient.js';
import Logger from './logger.js';
import { WebSocketServer } from 'ws';


const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });
console.log("The WebSocket server is running on port " + PORT);
Logger.log("======= STARTING SERVER =======", null, 'SYSTEM');
Logger.log("The WebSocket server is running on port " + PORT, null, 'SYSTEM');

wss.on("connection", _conn => new UnDifferentiatedClient(_conn));

// Remove disconnected clients
const interval = setInterval(function () {
  clients.forEach(function (client) {
    if (client.isAlive === false) return client.conn.terminate();
    client.isAlive = false;
    client.conn.ping();
    client.send({type: "heartbeat"});
  });
}, 10000);


// Import services through servicemanager
import ServiceManager from './serviceManager.js';

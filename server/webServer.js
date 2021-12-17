

import express from 'express';
import { URL } from 'url';
import fs from 'fs';

const Logger = console;
const Express = express();
const PORT = process.env.port || 8080;

console.log("Starting webserver on port " + PORT);


let server = Express.listen(PORT, () => {Logger.log('[!] Server started on port ' + PORT)});
Express.get('/*', handleRequest);
Express.post('/*', handleRequest);

function handleRequest(req, res) {
    if (req._parsedUrl.pathname == '/onLogin') return handleLoginRedirect(req, res);;
    if (req.url == '/stop') 
    {
        Logger.log('=== Stopping server ===');
        server.close();
        res.send('Stopping server...');
        return;
    }

    if (req.url.split('/API').length > 1) return handleAPIResources(req, res); // API requests are handled somewhere else
    return handleStaticResources(req, res);
}

function handleLoginRedirect(req, res) {
    res.send("<script>localStorage.userKey = '" + req.query.data + "'; window.location.replace('./')</script>");
}

function handleStaticResources (req, res) {
    let path = new URL('../interface/dist/' + req.url, import.meta.url).pathname;
    res.sendFile(path);
};

async function handleAPIResources(req, res) {
};



export default server;





const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const config = require('./config');
const db = require('./db');
const socketEvents = require('./socketEvents');

app.use('/', express.static(__dirname + '/public'));

app.get('/status', (_req, res) => {
    res.json(db.dump());
});

// manage cors
//var whitelist = ['http://localhost:3000', 'http://example2.com'];
//io.origins((origin, callback) => {
//    if (whitelist.indexOf(origin) !== -1 || !origin) {
//        callback(null, true);
//    }
//    callback(new Error('Not allowed by CORS'));
//});

io.on('connect', socketEvents.connection);

server.listen(config.port, null, () => {
    console.log(`rendezvous signaling server is listening on port ${config.port} !`);
});
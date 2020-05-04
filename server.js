const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const config = require('./config');
const db = require('./db');
const socketEvents = require('./socketEvents');

app.use('/', express.static(__dirname + '/public'));
app.use('/stylesheets/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));

app.get('/status', (_req, res) => {
    res.json(db.dump());
});

// manage cors
io.origins((origin, callback) => {
    if (config.cors_whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
});

io.on('connect', socketEvents.connection);

server.listen(config.port, null, () => {
    console.log(`rendezvous signaling server is listening on port ${config.port} !`);
});
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const config = require('./config');
const db = require('./db');
const socketEvents = require('./socketEvents');

app.use('/', express.static(__dirname + '/public'));

// stylesheet
app.use('/css/bootstrap/', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css/fontawesome/', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));

// js
app.use('/js/jquery/', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js/popper.js/', express.static(__dirname + '/node_modules/popper.js/dist/umd'));
app.use('/js/bootstrap/', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js/webrtc-adapter/', express.static(__dirname + '/node_modules/webrtc-adapter/out'));

app.get('/status', (_req, res) => {
    res.json(db.dump());
});

app.get('/:room', (_req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// manage cors
io.origins((origin, callback) => {
    if(config.cors_whitelist.filter(item => origin.startsWith(item)).length > 0) {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
});

io.on('connect', socketEvents.connection);

server.listen(config.port, null, () => {
    console.log(`rendezvous signaling server is listening on port ${config.port} !`);
});
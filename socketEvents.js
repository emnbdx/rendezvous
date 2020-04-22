const config = require('./config');
const db = require('./db');

module.exports.connection = (socket) => {
    socket.channels = {};
    db.sockets[socket.id] = socket;

    console.log(`[${socket.id}] connection accepted`);

    const disconnect = () => {
        for (var channel in socket.channels) {
            part(channel);
        }
        console.log(`[${socket.id}] disconnected`);
        delete db.sockets[socket.id];
    }

    const join = (conf) => {
        console.log(`[${socket.id}] join `, conf);
        var channel = conf.channel;
        var userdata = conf.userdata;

        if (channel in socket.channels) {
            console.log(`[${socket.id}] ERROR: already joined `, channel);
            return;
        }

        if (!(channel in db.channels)) {
            db.channels[channel] = {};
        }

        if(Object.keys(db.channels[channel]).length >= config.channel_capacity) {
            console.log(`[${socket.id}] ERROR: channel full `, channel);
            return;
        }

        for (id in db.channels[channel]) {
            db.channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
            socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true});
        }

        db.channels[channel][socket.id] = socket;
        socket.channels[channel] = channel;
    }

    const part = (channel) => {
        console.log(`[${socket.id}] part `);

        if (!(channel in socket.channels)) {
            console.log(`[${socket.id}] ERROR: not in `, channel);
            return;
        }

        delete socket.channels[channel];
        delete db.channels[channel][socket.id];

        for (id in db.channels[channel]) {
            db.channels[channel][id].emit('removePeer', {'peer_id': socket.id});
            socket.emit('removePeer', {'peer_id': id});
        }
    }

    const relayICECandidate = (conf) => {
        var peer_id = conf.peer_id;
        var ice_candidate = conf.ice_candidate;
        //console.log(`[${socket.id}] relaying ICE candidate to [${peer_id}] `, ice_candidate);

        if (peer_id in db.sockets) {
            db.sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
        }
    }

    const relaySessionDescription = (conf) => {
        var peer_id = conf.peer_id;
        var session_description = conf.session_description;
        //console.log(`[${socket.id}] relaying session description to [${peer_id}] `, session_description);

        if (peer_id in db.sockets) {
            db.sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description});
        }
    }

    socket.on('disconnect', disconnect);
    socket.on('join', join);    
    socket.on('part', part);
    socket.on('relayICECandidate', relayICECandidate);
    socket.on('relaySessionDescription', relaySessionDescription);
};
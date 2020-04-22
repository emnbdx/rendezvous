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

    const join = (config) => {
        console.log(`[${socket.id}] join `, config);
        var channel = config.channel;
        var userdata = config.userdata;

        if (channel in socket.channels) {
            console.log(`[${socket.id}] ERROR: already joined `, channel);
            return;
        }

        if (!(channel in db.channels)) {
            db.channels[channel] = {};
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

    const relayICECandidate = (config) => {
        var peer_id = config.peer_id;
        var ice_candidate = config.ice_candidate;
        console.log(`[${socket.id}] relaying ICE candidate to [${peer_id}] `, ice_candidate);

        if (peer_id in db.sockets) {
            db.sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
        }
    }

    const relaySessionDescription = (config) => {
        var peer_id = config.peer_id;
        var session_description = config.session_description;
        console.log(`[${socket.id}] relaying session description to [${peer_id}] `, session_description);

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
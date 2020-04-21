var channels = {};
var sockets = {};

var dump = function () {
    var dump = {};

    Object.keys(channels).forEach((mkey) =>{
        dump[mkey] = Object.keys(channels[mkey]).map( o => {
            return {
                id: sockets[o].id, 
                connected: sockets[o].connected
            }
        })
    });

    return dump;
};

module.exports = {
    channels,
    sockets,
    dump
};
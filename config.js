var config = {};

config.port = process.env.PORT || 3000;
config.channel_capacity = process.env.CHANNEL_CAPACITY || 2;

module.exports = config;
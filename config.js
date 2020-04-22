var config = {};

config.port = process.env.PORT || 3000;
config.cors_whitelist = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : ['http://localhost:3000/'];
config.channel_capacity = process.env.CHANNEL_CAPACITY || 2;

module.exports = config;
const Discord = require('discord.js');
const client = new Discord.Client();
const plugins = require('.');

plugins.setup(client, {
  prefix: '!'
});

client.use(plugins.ping, { response: message => `Pong! (${Math.round(client.ping)}ms)` });

client.login(require('./exampleSettings').token);

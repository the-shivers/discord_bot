"use strict";

//Handles all basically call-response functions

function ping(msg, content) {
  msg.reply('Pong!');
}

function pong(msg, content) {
  msg.reply('Ping!');
}

function trick(msg, content) {
  msg.channel.send('wtf');
}

module.exports = { ping, pong, trick }

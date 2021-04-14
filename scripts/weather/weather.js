"use strict";

// Define constants
const fs = require('fs');
const request = require('request');
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));
var open_weather_options = api_keys.open_weather_options;

// Weather
function weather(msg, content) {
  open_weather_options.qs.q = content.split(' ').slice(1).join(' ');
  request(open_weather_options, function (error, response, body) {
    if (error) throw new Error(error);
    //msg.channel.send(JSON.parse(body));
    msg.channel.send(body);
  });
}

module.exports = { weather };

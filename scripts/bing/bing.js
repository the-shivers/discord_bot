// Define Constants
const fs = require('fs');
const request = require("request");
const Discord = require("discord.js");
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));
const f = require('../../funcs.js');

// API Options
var bing_options = api_keys.bing_options;

function bing(msg, content) {
  //just bing it
  let components = content.split(' ');
  if (components.length > 1) {
    bing_options.qs.q = components.slice(1).join(' ');
    if (bing_options.qs.q.length > 150) {
      msg.channel.send("That bing was too long!");
    } else {
      request(bing_options, function (error, response, body) {
      	if (error) throw new Error(error);
        let parsed = JSON.parse(body);
        if (parsed.value.length === 0) {
          msg.channel.send("Bing messed it up!!!");
        } else {
          msg.channel.send(parsed.value[0].contentUrl)
        }
      })
    }
  } else {
    msg.channel.send("Did you forget to bing something?");
  }
}

module.exports = { bing };

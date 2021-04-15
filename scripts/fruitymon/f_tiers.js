"use strict";

// Imports
const c = require('./f_config.js');
const Discord = require('discord.js');
const attachment = new Discord.MessageAttachment(
  './scripts/bing/assets/bing_logo.png', 'bing_logo.png'
);

// Create template to embed
const template = new Discord.MessageEmbed()
  .setColor('#0099ff')
  .setTitle("Just Bing It!")
  .setDescription('_Do you feel the bing?_')
  .attachFiles(attachment)
  .setThumbnail('attachment://bing_logo.png');

// Add fruit to template based on f_config.js
var i;
for (i = 0; i < c.fruit.length; i++) {
  template.addField(
    i + 1 + ". " + c.fruit[i].name + " `(" + c.fruit[i].rarity_int + "%)`",
    c.fruit[i].fruit.join(" "),
    true
  )
}

// Send template to channel
function tiers(msg, content) {
  msg.channel.send(template);
}

module.exports = { tiers };

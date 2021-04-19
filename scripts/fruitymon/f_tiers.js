"use strict";

// Imports
const c = require('./f_config.js');
const Discord = require('discord.js');
const attachment = new Discord.MessageAttachment(
  './scripts/fruitymon/assets/orange.gif', 'orange.gif'
);

// Create template to embed
const template = new Discord.MessageEmbed()
  .setColor('#0099ff')
  .setTitle("⭐🌟✨ FRUITYMON RARITY ✨🌟⭐")
  .setDescription('_Can you catch them all?_ Fruit within individual tiers are arranged least to most rare.\u200b\n\u200b\n')
  .attachFiles(attachment)
  .setThumbnail('attachment://orange.gif');

// Add fruit to template based on f_config.js
var i;
for (i = 0; i < c.fruit_tiers.length; i++) {
  template.addField(
    i + 1 + ". " + c.fruit_tiers[i].name + " \n`(" + c.fruit_tiers[i].rarity_int + "%)`",
    c.fruit_tiers[i].fruit.join(" "),
    true
  )
}

// Send template to channel
function tiers(msg, content) {
  msg.channel.send(template);
}

module.exports = { tiers };

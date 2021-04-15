"use strict";

// Imports
const c = require('./f_config.js');
const Discord = require('discord.js');
const attachment = new Discord.MessageAttachment(
  './scripts/fruitymon/assets/fruit.gif', 'fruit.gif'
);

// Create template to embed
const template = new Discord.MessageEmbed()
  .setColor('#ff5555')
  .setTitle("🧺 Your Inventory 🧺")
  .setDescription("Here are your captures so far!\u200b\n\u200b\n")
  .attachFiles(attachment)
  .setImage('attachment://fruit.gif');

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

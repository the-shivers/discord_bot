"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
const f_record = require(record_filename);
const Discord = require('discord.js');

// Create attachment
const attachment = new Discord.MessageAttachment(
  './scripts/fruitymon/assets/cherry_bounce.gif', 'cherry_bounce.gif'
);

function countEmoji(msg, emoji) {
  let inv = f_record[msg.author.id]["Fruit Inventory"];
  var count = 0;
  for(var i = 0; i < inv.length; i++) {
    if(inv[i] == emoji)
      count++;
  }
  return count;
}

function generateTierCounts(msg, tier_num) {
  let result = [];
  let tier_fruit = c.fruit[tier_num].fruit;
  for(var i = 0; i < tier_fruit.length; i++) {
    let emoji_count = countEmoji(msg, tier_fruit[i]);
    if (emoji_count !== 0) {
      result = result.concat({"name":tier_fruit[i], "emoji_count":emoji_count});
    }
  }
  console.log(result)
  result.sort((a, b) => (a.emoji_count < b.emoji_count) ? 1 : -1)
  let result_str = "\u200b";
  for(var i = 0; i < result.length; i++) {
    result_str += result[i].name + ": " + result[i].emoji_count + "\n"
  }
  console.log("here is result str");
  console.log(result_str);
  return result_str;
}

function inventory(msg, content) {
  // Create template to embed
  const template = new Discord.MessageEmbed()
    .setColor('#ff5555')
    .setTitle("🧺 Your Inventory 🧺")
    .setDescription("Here are your captures so far!\u200b\n\u200b\n")
    .attachFiles(attachment)
    .setImage('attachment://cherry_bounce.gif');
  for(var i = 0; i < c.fruit.length; i++) {
    template.addField(c.fruit[i].name, generateTierCounts(msg, [i]), true);
  }
  msg.channel.send(template);
}

module.exports = { inventory };

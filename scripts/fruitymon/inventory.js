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

function countStr(msg, str) {
  let inv = f_record[msg.author.id]["Fruit Inventory"];
  var count = 0;
  for(var i = 0; i < inv.length; i++) {
    if(inv[i] === str)
      count++;
  }
  return count;
}

function generateTierCounts(msg, tier_num) {
  let result = [];
  let tier_fruit_str = c.fruit_tiers[tier_num].fruit_str;
  let tier_fruit_emo = c.fruit_tiers[tier_num].fruit;
  for(var i = 0; i < tier_fruit_str.length; i++) {
    let count = countStr(msg, tier_fruit_str[i]);
    if (count !== 0) {
      result = result.concat({"name":tier_fruit_emo[i], "count":count});
    }
  }
  result.sort((a, b) => (a.count < b.count) ? 1 : -1)
  let result_str = "\u200b";
  for(var i = 0; i < result.length; i++) {
    result_str += result[i].name + " `x" + result[i].count + "`\n"
  }
  return result_str;
}

function inventory(msg, content) {
  // Create template to embed
  const template = new Discord.MessageEmbed()
    .setColor('#ff5555')
    .setTitle("🧺 Your Inventory 🧺")
    .attachFiles(attachment)
    .setThumbnail('attachment://cherry_bounce.gif')
    .addField(
      "Your Fruitbux:",
      "`₣" + f_record[msg.author.id]["Fruitbux"] + ".00`",
      false
    )
  for(var i = 0; i < c.fruit_tiers.length; i++) {
    template.addField(i + 1 + ". " + c.fruit_tiers[i].name, generateTierCounts(msg, [i]), true);
  }
  // Add items. First create pretty item string.
  let item_str = '\u200b';
  for (let i = 0; i < f_record[msg.author.id]["Item Inventory"].length; i++) {
    let curr_item = new c.Item(f_record[msg.author.id]["Item Inventory"][i].name);
    item_str += "`" + curr_item.name + "` - " + curr_item.desc + "\n"
  }
  template.addField("Your items:", item_str, false);
  msg.channel.send(template);
}

module.exports = { inventory };

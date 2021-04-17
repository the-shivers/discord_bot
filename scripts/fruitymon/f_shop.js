"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const Discord = require('discord.js');

function generatePrices(msg, ind) {
  let return_str = '';
  let fruit_tier = c.fruit_tiers[ind]
  for (let i = 0; i < fruit_tier.fruit.length; i++) {
    return_str += 10 + "\n"
  }
  return return_str;
}

function priceFruit(msg, fr_str) {
  // Takes msg and fruit string to generate fruit price
  return 10;
}

function f_shop(msg, content) {
  // Assemble attachment
  const attachment = new Discord.MessageAttachment(
    './scripts/fruitymon/assets/fruit_stand.gif', 'fruit_stand.gif'
  );
  const template = new Discord.MessageEmbed()
    .setColor('#FFDD55')
    .setTitle("The Fruit Shop is now in business!")
    .setDescription("HELLO I WILL BUY YOUR FRUIT IM THE FRUIT STORE")
    .attachFiles(attachment)
    .setThumbnail('attachment://fruit_stand.gif')
    .addField(c.fruit_tiers[0].name, "`" + "Not buyin your trash lol" + "`", true)
    for(var i = 1; i < c.fruit_tiers.length; i++) {
      template.addField(c.fruit_tiers[i].name, generatePrices(msg, [i]), true);
    }
    template.addField("Items:", "`" + "bro these are where items will go..." + "`", false)
  msg.channel.send(template);
}





module.exports = {f_shop};

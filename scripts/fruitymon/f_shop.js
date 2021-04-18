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
    let curr_fruit = new c.Fruit(fruit_tier.fruit_str[i]);
    return_str += fruit_tier.fruit[i] + " `₣" + priceFruit(curr_fruit) + ".00`\n"
  }
  return return_str;
}

function priceFruit(fruit) {
  if (fruit.tier === 1) {
    return 0;
  }
  return fruit.exp;
}

function f_shop(msg, content) {
  // Assemble attachment
  const attachment = new Discord.MessageAttachment(
    './scripts/fruitymon/assets/fruit_stand.gif', 'fruit_stand.gif'
  );
  const template = new Discord.MessageEmbed()
    .setColor('#FFDD55')
    .setTitle("The Fruit Shop is now in business!")
    .setDescription(
      "Welcome! To sell, try one of the following options:\n\n"
      + "Sell one type of fruit: `!f sell <fruit emoji> <quantity>`\n"
      + "Sell all of one tier: `!f sell <tier number>`\n"
      + "Sell all: `!f sell all`"
    )
    .attachFiles(attachment)
    .setThumbnail('attachment://fruit_stand.gif')
    //.addField(c.fruit_tiers[0].name, "`" + "We don't buy trash, sorry!" + "`", true)
    for(var i = 0; i < c.fruit_tiers.length; i++) {
      template.addField((i + 1) + ". " + c.fruit_tiers[i].name, generatePrices(msg, [i]), true);
    }
    template.addField("Items:\nTo buy, try !f buy <item_name>\n", "`" + "bro these are where items will go..." + "`", false)
  msg.channel.send(template);
}

function f_sell(msg, content) {
  let inv = f_record[msg.author.id]["Fruit Inventory"];
  let val = 0;
  let tfs = 0;
  let trfs = 0;
  let success = 1;
  console.log("original val is", val)
  msg.channel.send("tryna sell......");

  // Parse the message, starting by removing blank strings from double spaces
  content = content.split("  ").join(" ");

  // Identify what they want, then choose how to proceed.
  if (content === "all") {
    for (let i = 0; i < inv.length; i++) {
      let curr_fruit = new c.Fruit(inv[i]);
        tfs++;
      if (curr_fruit.tier === 6) {
        trfs++;
      }
      val += priceFruit(curr_fruit);
    }
    inv = []
  } else if (
    f.isNumeric(content.split(' ')[0]) &&
    parseInt(content.split(' ')[0]) < 7 &&
    parseInt(content.split(' ')[0]) > 0
  ) {
    let rem_list = [];
    for (let i = 0; i < inv.length; i++) {
      var curr_fruit = new c.Fruit(inv[i]);
      if (curr_fruit.tier == parseInt(content.split(' ')[0])) {
        val += priceFruit(curr_fruit);
        rem_list = rem_list.concat([i]);
        console.log("in loop, val=",val, "rem_list = ", rem_list)
      }
    }
    for (var i = rem_list.length -1; i >= 0; i--) {
      inv.splice(rem_list[i],1);
    }
    tfs += rem_list.length;
    if (parseInt(content.split(' ')[0]) === 6) {
      trfs += rem_list.length;
    }
  } else if (
    content.split(' ')[0] in c.emoji_to_string &&
    f.isNumeric(content.split(' ')[1])
  ) {
    console.log("Selling " + content.split(' ')[1] + " " + content.split(' ')[0] + "s")
    let rem_list = [];
    for (let i = 0; i < inv.length; i++) {
      var curr_fruit = new c.Fruit(inv[i]);
      console.log(curr_fruit.emoji == parseInt(content.split(' ')[0]))
      console.log(curr_fruit.emoji, parseInt(content.split(' ')[0]))
      if (curr_fruit.emoji == content.split(' ')[0]) {
        val += priceFruit(curr_fruit);
        rem_list = rem_list.concat([i]);
        console.log("in loop, val=",val, "rem_list = ", rem_list)
      }
    }
    for (var i = Math.min(rem_list.length,parseInt(content.split(' ')[1]))-1; i >= 0; i--) {
      inv.splice(rem_list[i],1);
    }
    tfs += Math.min(rem_list.length,parseInt(content.split(' ')[1]));
    if (curr_fruit.tier === 6) {
      trfs += Math.min(rem_list.length,parseInt(content.split(' ')[1]));
    }
  } else {
    success = false;
    msg.channel.send("You either didn't have what you wanted to sell, or entered the command wrong. Sorry bro!");
  }
  if (success) {
    console.log("tfs is", tfs, "trfs is", trfs);
    f_record[msg.author.id]["Fruit Inventory"] = inv;
    f_record[msg.author.id]["Fruitbux"] += val;
    f_record[msg.author.id]["Total Fruitbux Earned"] += val;
    f_record[msg.author.id]["Total Fruit Sold"] += tfs;
    f_record[msg.author.id]["Total Rare Fruit Sold"] += trfs;
    msg.channel.send("Congrats on your sale! You made `₣" + val + "`")
    fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
  }
}

function f_buy(msg, content) {
  msg.channel.send("you like totally bought something lol");
}

module.exports = {f_shop, f_sell, f_buy};

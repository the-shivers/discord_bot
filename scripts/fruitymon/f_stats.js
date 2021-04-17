"use strict";

// Imports
const c = require('./f_config.js');
const p = require('./f_pick.js')
const fs = require('fs');
var f_record = require('./f_record.json');
const Discord = require('discord.js');

function stats(msg, content) {
  // Get basic info
  let user_json = f_record[msg.author.id];
  let style_str = ""
  let mo_str = "You typically roll `" + user_json["Number of Dice"]
  + "d" + user_json["Dice Sides"] + "`. ";
  if (user_json["Perks"].includes("greedy")) {
    style_str = "Greedy"
    mo_str += "Then, being `greedy`, you take the lowest `"
    + user_json["Pick Limit"] + "` of them.";
  } else if (user_json["Perks"].includes("lucky")) {
    style_str = "Lucky"
    mo_str += "Then, being `lucky`, you take the highest `"
    + user_json["Pick Limit"] + "` of them.";
  }
  mo_str += " You must wait `" + user_json["Roll Delay"]
  + "` seconds before picking again."
  let exp_to_next_lvl = c.levels[user_json["Level"]];
  let exp_frac = Math.min(1, user_json["Experience"] / exp_to_next_lvl);
  let [expb1, expb2] = p.generateExpBar(exp_frac, user_json["Level"]);
  let fill = '\u200b';

  // Details
  let detail_str = "";
  detail_str += "`Fruit Picked: "
  + user_json["Total Fruit Picked"] + '`\n';
  detail_str += "`Rare Fruit Picked: "
  + user_json["Total Rare Fruits Picked"] + '`\n';
  detail_str += "`Fruitbux Earned: "
  + user_json["Total Fruitbux Earned"] + '`'

  // Perks
  let perk_str = "";
  for (let i = 0; i < user_json["Perks"].length; i++) {
    let perk = c.perk_dict[user_json["Perks"][i]];
    perk_str += "\u200b • `" + perk.str + "` - " + perk.desc + "\n"
  }

  // Assemble attachment
  const attachment = new Discord.MessageAttachment(
    './scripts/fruitymon/assets/frog.gif', 'frog.gif'
  );
  const template = new Discord.MessageEmbed()
    .setColor('#4499ff')
    .setTitle("Fruitymon Trainer Profile: " + msg.author.username)
    //.setDescription("Level 2")
    .attachFiles(attachment)
    .setThumbnail('attachment://frog.gif')
    .addField("Level:", "`" + user_json["Level"] + "`", true)
    .addField("Rank:", "`" + c.ranks[user_json["Level"]] + "`", true)
    .addField("Style:", "`" + style_str + "`", true)
    .addField("Modus Operandi:", mo_str, false)
    .addField("Fruitbux:", "`"+ user_json["Fruitbux"] + "`", true)
    .addField("Experience:", "`"+ user_json["Experience"] + "`", true)
    .addField("To next level:", "`" + exp_to_next_lvl + "`", true)
    //.addField(fill, expb2 + '\n' + fill, false)
    .addField("Details:", detail_str, true)
    .addField("Perks:", perk_str, true)
  msg.channel.send(template);
}

module.exports = { stats };

"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const Discord = require('discord.js');

function updatePerks(msg, selected_perk, f_record) {
  //Creates record with updated perks and perk-related stats
  perk = c.perk_dict[selected_perk]
  Object.keys(perk.effects).forEach(function(key) {
     console.log(key + " " + perk.effects[key]);
     f_record[msg.author.id][key] += perk.effects[key];
  });


  // if (selected_perk === 'lucky') {
  //   f_record[msg.author.id]["Number of Dice"] += 2
  // } else if (selected_perk === 'greedy') {
  //   f_record[msg.author.id]["Number of Dice"] += 8
  //   f_record[msg.author.id]["Pick Limit"] += 5
  // }

  f_record[msg.author.id]["Perks"] = f_record[msg.author.id]["Perks"].concat(selected_perk);
  return f_record;
}

function offerPerks(msg, level, perks) {
  // Returns array of perks you could get
  let perk_opt1 = c.greedy;
  let perk_opt2 = c.lucky;
  if (perks.includes('greedy')) {
    perk_opt1 = c.greedy_perks[perks.length][0]
    perk_opt2 = c.greedy_perks[perks.length][1]
  } else if (perks.includes('lucky')) {
    perk_opt1 = c.lucky_perks[perks.length][0]
    perk_opt2 = c.lucky_perks[perks.length][1]
  }
  return [perk_opt1, perk_opt2];
}

function perk(msg, content) {
  // Offer perks.
  let level = f_record[msg.author.id]["Level"];
  let perks = f_record[msg.author.id]["Perks"]
  let perk_num = level - perks.length - 1; // num of available perks
  let avail_perks = offerPerks(msg, level, perks);
  //console.log(avail_perks);
  let p1 = avail_perks[0];
  let p2 = avail_perks[1];
  // TO DO: Style content and give perk names and descriptions
  if (content === "") {
    if (perk_num > 0) {
      // STYLE THIS SECTION OF WHAT PERKS THEY COULD HAVE
      const attachment = new Discord.MessageAttachment('./scripts/fruitymon/assets/question_mark.gif', 'question_mark.gif');
      const template = new Discord.MessageEmbed()
        .setColor('#AACC33')
        .setTitle("↔️ Select a perk! ↔️")
        .setDescription("\u200b\n")
        .attachFiles(attachment)
        .setThumbnail('attachment://question_mark.gif')
        .addField('Option 1: ' + p1.proper, "`!f perks " + p1.str + "`\n" + p1.desc, true)
        .addField('Option 2: ' + p2.proper, "`!f perks " + p2.str + "`\n" + p2.desc, true)
        .addField("\u200b", "\u200b", false)
        .setFooter("*Don't pick the wrong thing! This decision is irreversible!*");
      msg.channel.send(template);
      //
    } else {
      msg.channel.send("Sorry, no perks available for you!");
    }
  } else if (content.split(' ').length === 1) {
    if (perk_num > 0) {
      let selected_perk = content.split(' ')[0];
      if ([p1.str, p2.str].includes(selected_perk)) {
        msg.channel.send(`You got the ${selected_perk} perk! See ` + "`!f stats` to see updated statistics.");
        f_record = updatePerks(msg, selected_perk, f_record);
        fs.writeFile(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
          if (err) return console.log(err);
        });
      } else {
        msg.channel.send("That perk isn't available!");
      }
    } else {
      msg.channel.send("Sorry, no perks available for you!");
    }
  } else {
    msg.channel.send("You fucked it up!");
  }
}

module.exports = { perk };

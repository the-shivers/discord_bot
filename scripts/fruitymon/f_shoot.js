"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const Discord = require('discord.js');

let steal_size = 5;

function f_shoot(msg, content) {
  msg.reply("*shoots u*")
  // if (msg.mentions.users.size > 0) {
  //   let target = msg.mentions.users.first();
  //   if (target.id in f_record && f_record[target.id]["Fruit Inventory"].length > 0) {
  //     let their_inv = f_record[target.id]["Fruit Inventory"]
  //     their_inv = f.shuffle(their_inv);
  //     let stolen = their_inv.slice(0, Math.min(their_inv.length, steal_size));
  //     let updated = their_inv.slice(Math.min(their_inv.length, steal_size));
  //     f_record[target.id]["Fruit Inventory"] = updated;
  //     f_record[msg.author.id]["Fruit Inventory"] = f_record[msg.author.id]["Fruit Inventory"].concat(stolen);
  //     let stolen_emojis = [];
  //     for (let i = 0; i < stolen.length; i++) {
  //       stolen_emojis = stolen_emojis.concat(c.string_to_emoji[stolen[i]]);
  //     }
  //     msg.reply("Success! Stole " + stolen_emojis.join(' ') + ` from ${target.username}!`)
  //   } else {
  //     msg.reply("they aint got shit")
  //   }
  // } else {
  //   msg.reply("You gotta mention someone, dude.")
  // }
  // fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
  //   if (err) return console.log(err);
  // });
}

let steal_money_amount = 500;

module.exports = {f_shoot};

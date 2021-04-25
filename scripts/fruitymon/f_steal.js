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

function f_steal(msg, content) {
  if (msg.mentions.users.size > 0) {
    let target = msg.mentions.users.first();
    if (target.id in f_record && f_record[target.id]["Fruit Inventory"].length > 0) {
      for (let i = f_record[target.id]["Item Inventory"].length - 1; i >= 0; i--) {
        if (f_record[target.id]["Item Inventory"][i].name === "lock") {
          let lock_exp = c.item_dict["lock"].exp;
          let curr_time = msg.createdTimestamp;
          let lock_creation = f_record[target.id]["Item Inventory"][i].date;
          if (lock_creation + lock_exp * 1000 <= curr_time) {
            // Lock expires.
            f_record[target.id]["Item Inventory"].splice(i, 1);
            continue;
          }
          msg.reply("Their shit is all locked up!")
          return;
        }
      }
      let their_inv = f_record[target.id]["Fruit Inventory"]
      their_inv = f.shuffle(their_inv);
      let stolen = their_inv.slice(0, Math.min(their_inv.length, steal_size));
      let updated = their_inv.slice(Math.min(their_inv.length, steal_size));
      f_record[target.id]["Fruit Inventory"] = updated;
      f_record[msg.author.id]["Fruit Inventory"] = f_record[msg.author.id]["Fruit Inventory"].concat(stolen);
      let stolen_emojis = [];
      for (let i = 0; i < stolen.length; i++) {
        stolen_emojis = stolen_emojis.concat(c.string_to_emoji[stolen[i]]);
      }
      msg.reply("Success! Stole " + stolen_emojis.join(' ') + ` from ${target.username}!`)
    } else {
      msg.reply("they aint got shit")
    }
  } else {
    msg.reply("You gotta mention someone, dude.")
  }
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

let steal_money_amount = 500;

function f_steal_m(msg, content) {
  if (msg.mentions.users.size > 0) {
    let target = msg.mentions.users.first();
    if (target.id in f_record && f_record[target.id]["Fruitbux"] > 0) {
      for (let i = f_record[target.id]["Item Inventory"].length - 1; i >= 0; i--) {
        if (f_record[target.id]["Item Inventory"][i].name === "lock") {
          let lock_exp = c.item_dict["lock"].exp;
          let curr_time = msg.createdTimestamp;
          let lock_creation = f_record[target.id]["Item Inventory"][i].date;
          if (lock_creation + lock_exp * 1000 <= curr_time) {
            // Lock expires.
            f_record[target.id]["Item Inventory"].splice(i, 1);
            continue;
          }
          msg.reply("Their shit is all locked up!")
          return;
        }
      }
      let actual_theft_amt = Math.min(f_record[target.id]["Fruitbux"], steal_money_amount);
      f_record[target.id]["Fruitbux"] -= actual_theft_amt
      f_record[msg.author.id]["Fruitbux"] += actual_theft_amt
      msg.reply("Success! Stole `₣" + actual_theft_amt + ".00` from " + `${target.username}!`)
    } else {
      msg.reply("they aint got shit")
    }
  } else {
    msg.reply("You gotta mention someone, dude.")
  }
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

module.exports = {f_steal, f_steal_m};

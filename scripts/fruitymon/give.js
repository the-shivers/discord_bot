"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const Discord = require('discord.js');


function countFruitStr(arr, fruit_str) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === fruit_str) count++
  }
  return count;
}

function f_give(msg, content) {
  if (
    msg.mentions.users.size > 0 &&
    msg.author.id in f_record &&
    msg.mentions.users.first().id in f_record
  ) {
    let qty = 1
    let split = content.split(' ').filter(Boolean);
    let target = msg.mentions.users.first();
    let emoji = split[1];
    if (split.length === 3 && f.isNumeric(split[2])) {qty = split[2]}
    // if u used impropoer emoji...
    if (!(emoji in c.emoji_to_string)) {
      msg.reply("What the heck! Use a real fruit (or piece of trash, if that's your style)!")
      return ;
    }
    let fruit_str = c.emoji_to_string[emoji];
    let fruit_count = countFruitStr(f_record[msg.author.id]["Fruit Inventory"], fruit_str);
    // if u dont have fruit...
    if (fruit_count === 0) {
      msg.reply("You don't have any " + emoji + "!")
      return ;
    }
    let true_give_amt = Math.min(fruit_count, qty);
    for (let i = 0; i < true_give_amt; i++) {
      f_record[target.id]["Fruit Inventory"].push(fruit_str);
    }
    // Now remove those fruit from ur inv...
    let removed_fruit_count = 0;
    for (let i = f_record[msg.author.id]["Fruit Inventory"].length; i >= 0; i--) {
      if (f_record[msg.author.id]["Fruit Inventory"][i] === fruit_str) {
        f_record[msg.author.id]["Fruit Inventory"].splice(i, 1)
        removed_fruit_count++;
      }
      if (removed_fruit_count === true_give_amt) {break;}
    }
    fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
    msg.reply("Success! Gave " + true_give_amt + " " + emoji + ` to ${target.username}!`)
  } else {
    msg.reply("You gotta mention someone, dude. That, or you or your target aren't playing Fruitymon.")
  }
}

function f_give_m(msg, content) {
  console.log(content.split(' '))
  if (msg.mentions.users.size > 0 && f.isNumeric(content.split(' ')[1])) {
    let target = msg.mentions.users.first();
    let amount = parseInt(content.split(' ')[1]);
    if (
      msg.author.id in f_record &&
      target.id in f_record &&
      f_record[msg.author.id]["Fruitbux"] > 0
    ) {
      let actual_give_amt = Math.min(f_record[target.id]["Fruitbux"], amount);
      f_record[target.id]["Fruitbux"] += actual_give_amt
      f_record[msg.author.id]["Fruitbux"] -= actual_give_amt
      msg.reply("Success! Gave `₣" + actual_give_amt + ".00` to " + `${target.username}!`)
    } else {
      msg.reply("You're either poor, not playing, or they're not playing Fruitymon, dude.")
    }
  } else {
    msg.reply("You gotta mention someone or include a money amount, dude.")
  }
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

module.exports = {f_give, f_give_m};

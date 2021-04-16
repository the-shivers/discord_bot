"use strict";

// Define constants
const fs = require('fs');
const c = require('./f_config.js');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
const f_record = require(record_filename);
const f_command_dict = require('./f_command_dict.js').f_command_dict;

// Command combiner
function f(msg, content) {
  let command = content.split(' ')[1];
  let rem_content = content.split(' ').slice(2).join(' ');
  if (command in f_command_dict) {

    // LOGIC FOR RECORDKEEPING
    let new_key = msg.author.id;
    if (!(new_key in f_record)) {
      f_record[new_key] = {
        "Username": msg.author.username,
        "First Fruitymon Command": msg.createdTimestamp,
        "Fruit Inventory": [],
        "Item Inventory": [],
        "Fruitbux": 0,
        "Level": 1,
        "Experience": 0,
        "Perks": [],
        "Total Fruit Picked": 0,
        "Total Rare Fruits Picked": 0,
        "Total Fruit Sold": 0,
        "Total Rare Fruit Sold": 0,
        "Total Fruitbux Earned": 0,
        "Pick Limit": c.default_pick_limit, // how many you pick at a time
        "Number of Dice": c.default_pick_limit, // e.g. the 5 in 5d100
        "Dice Sides": c.default_sides, // Roll more/less dice, same # returned fruit
        "Last Roll": msg.createdTimestamp - 3605 * 1000,
        "Roll Delay": c.default_delay
      }
    };
    // Record
    fs.writeFile(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });

    // Execute command
    f_command_dict[command].func(msg, rem_content);
    console.log(f_command_dict[command].log);
  } else {
    msg.channel.send("That's not a real (fruitymon) command dude.");
  }
}

module.exports = { f };

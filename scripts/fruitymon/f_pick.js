"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
const f_record = require(record_filename);


function determineRolls(msg, content) {
  // Returns an array consisting of one boolean (indicating whether you can
  // roll), an explanation, and an array of rolls (if allowed, otherwise empty).
  // The last returned elements is the number of picks you'll perform. Because
  // of bonus dice, this is not always the same as the number of rolls.
  let prev_date = f_record[msg.author.id]["Today"]["Date"];
  let curr_date = msg.createdAt.toDateString().slice(4);
  if (prev_date === curr_date) {
    let max_picks = f_record[msg.author.id]["Daily Picks"];
    let today_picks = f_record[msg.author.id]["Today"]["Picks"];
    if (today_picks >= max_picks) {
      // You're at your daily limit!
      return [false, "You're at your daily limit!", [], 0];
    }
  } else {
    f_record[msg.author.id]["Today"]["Date"] = curr_date;
    f_record[msg.author.id]["Today"]["Picks"] = 0;
  }
  let dice_num_mod = f_record[msg.author.id]["Dice Number Modifier"];
  let single_pick_limit = f_record[msg.author.id]["Single Pick Limit"];
  let chosen_rolls = 1;
  if (f.isNumeric(content)) {
    chosen_rolls = parseInt(content, 10);
    if (chosen_rolls > single_pick_limit) {
      // You're picking more than allowed!
      return [
        false,
        "You're only allowed to pick " + single_pick_limit + ".",
        [],
        0
      ];
    }
  }
  // If you don't specify: choose 1, do max rolls
  let roll_array = [];
  let i;
  for (i = 0; i < single_pick_limit; i++) {
    roll_array = roll_array.concat(f.rollDie(100));
  }
  return [true, "", roll_array, chosen_rolls];
}


function pickTier(roll) {
  let sum = 0;
  var i;
  for (i = 0; i < c.fruit.length; i++) {
    if (roll <= sum + c.fruit[i].rarity_int) {
      return c.fruit[i];
    } else {
      sum += c.fruit[i].rarity_int
    }
  }
}


function pickFruit(tier) {
  return tier.fruit[Math.floor(Math.random() * tier.fruit.length)]
}


function pick(msg, content) {
  // This handles recording, alignment of dice and rolls, and messaging.
  let rolls_detailed = determineRolls(msg, content);
  console.log("rolls detailed from first function");
  console.log(rolls_detailed);
  let rolls = rolls_detailed[2];
  let fruit = [];
  if (rolls_detailed[0]) {
    // Align rolls and picks
    if (rolls !== rolls_detailed[3]) {
      rolls.sort(function(a, b) {return b - a;});
      rolls = rolls.slice(0, rolls_detailed[3]);
    }
    let i;
    for (i = 0; i < rolls.length; i++) {
      fruit = fruit.concat(pickFruit(pickTier(rolls[i])));
    }
    // Write Message
    msg.channel.send(fruit.join(""));
  } else {
    msg.channel.send(rolls_detailed[1]);
  }
  // Record
  f_record[msg.author.id]["Current Channel"] = msg.channel.id;
  f_record[msg.author.id]["Fruit Inventory"] =
    f_record[msg.author.id]["Fruit Inventory"].concat(fruit);
  f_record[msg.author.id]["Experience"] =
    f_record[msg.author.id]["Experience"] + fruit.length;
  f_record[msg.author.id]["Total Fruit Picked"] =
    f_record[msg.author.id]["Total Fruit Picked"] + fruit.length;
  // count rare fruit in fruit array
  let rare_fruit = 0;
  for(var i = 0; i < fruit.length; i++){
      if(c.fruit[5].fruit.includes(fruit[i])) {
        rare_fruit++;
      }
  }
  f_record[msg.author.id]["Total Rare Fruits Picked"] =
    f_record[msg.author.id]["Total Rare Fruits Picked"] + rare_fruit;
  if (fruit.length > 0) {
    f_record[msg.author.id]["Today"]["Picks"] =
      f_record[msg.author.id]["Today"]["Picks"] + 1;
  }
  fs.writeFile(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

module.exports = { pick };

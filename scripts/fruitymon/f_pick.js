"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const Discord = require('discord.js');

function generateRolls(msg, can_megaroll=false) {
  let roll_arr = [];
  let num_die = f_record[msg.author.id]["Number of Dice"];
  let sides = f_record[msg.author.id]["Dice Sides"];
  for (let i = 0; i < num_die; i++) {
    roll_arr = roll_arr.concat(f.rollDie(sides));
  }
  // Logic for special perks
  if (f_record[msg.author.id]["Perks"].includes("raccoon")) {
    for (let i = 0; i < 10; i++) {
      roll_arr = roll_arr.concat(f.rollDie(20));
    }
  }
  if (can_megaroll) {
    for (let i = 0; i < 40; i++) {
      roll_arr = roll_arr.concat(f.rollDie(100))
    }
  }

  return roll_arr;
}

function canRoll(msg) {
  let prev_time = f_record[msg.author.id]["Last Roll"];
  let curr_time = msg.createdTimestamp;
  let diff = Math.round((curr_time - prev_time)/1000);
  if (diff >= f_record[msg.author.id]["Roll Delay"]) {
    return [true, 0];
  }
  else {
    return [false, f_record[msg.author.id]["Roll Delay"] - diff];
  }
}

function pickLogic(msg, can_megaroll = false) {
  // Gets the correct number of numbers for your picks of your rolls
  // If you have 7 rolls and 5 picks, you may want the lowest or highest rolls.
  // Defaults to random rolls. Returns selected and discarded arrays.
  let roll_arr = generateRolls(msg, can_megaroll);
  let num_picks = f_record[msg.author.id]['Pick Limit'];
  for (let i = 0; i < f_record[msg.author.id]["Perks"].length; i++) {
    let curr_perk_str = f_record[msg.author.id]["Perks"][i];
    if (c.min_perk_group.includes(curr_perk_str)) {
      roll_arr.sort((a, b) => a - b); // For ascending sort
      break;
    } else if (c.max_perk_group.includes(curr_perk_str)) {
      roll_arr.sort((a, b) => b - a); // For descending sort
      break;
    }
  }
  // Adjust number of picks based on special perks. +1 for prodigy, +10 for hoarder
  if (f_record[msg.author.id]["Perks"].includes("raccoon")) {
    num_picks += 10;
  }
  if (can_megaroll) {
    num_picks += 40;
  }
  // Logic for special items
  // for (let i = 0; i < f_record[msg.author.id]["Item Inventory"].length; i++) {
  //   if (f_record[msg.author.id]["Item Inventory"][i].name === "megagreed") {
  //     num_picks += 5;
  //   }
  // }
  // Logic for sloth
  return [roll_arr.slice(0, num_picks), roll_arr.slice(num_picks)];
}

function fruitArray(arr, msg) {
  // returns a fruit array based on a numerical array
  let fruit_arr = [];
  let i;
  let j;
  for (i = 0; i < arr.length; i++) {
    for (j = 0; j < c.tier_cutoffs.length; j++) {
      if (arr[i] <= c.tier_cutoffs[j]) {
        break; // j is our tier index, j+1 is tier
      }
    }
    j = Math.min(j, 5) // Account for possibility of roles higher than 100, leading to j = 6
    let tier_rarity = c.tierRarity(c.fruit_tiers[j].fruit.length); // 1-indexed!
    let temp_val = c.fruit_tiers[j].fruit[tier_rarity - 1];
    let fruit_str = c.emoji_to_string[temp_val];
    let curr_fruit = new c.Fruit(fruit_str)
    // Coon logic
    if (
      f_record[msg.author.id]["Perks"].includes("raccoon") &&
      curr_fruit.tier === 1
    ) {
      let chance = Math.floor(Math.random() * 50)
      if (chance <= 4) {
        fruit_str = c.fruit_tiers[0].fruit_str[chance];
      }
    }
    fruit_arr = fruit_arr.concat(new c.Fruit(fruit_str));
  }
  return fruit_arr;
}

function generateExperience(msg, fruit_arr) {
  // Returns array of experience from an array of fruit
  let exp_arr = []
  for (let i = 0; i < fruit_arr.length; i++) {
    let exp = fruit_arr[i].exp
    exp_arr = exp_arr.concat(exp);
  }
  return exp_arr;
}

function generateExpBar(decimal, curr_level) {
  // Returns a cool expbar string! Header and string in array.
  let filled = "▰";
  let empty = "▱";
  let length = 20;
  let num_filled = Math.round(length * decimal);
  let num_empty = length - num_filled;
  let filled_arr = Array(num_filled).fill(filled);
  let empty_arr = Array(num_empty).fill(empty);
  let return_str1 = "**" + Math.round((decimal)*100) + "% to level "
   + (curr_level + 1) + "!**\n"
  let return_str2 = "```ini\n[" + filled_arr.join("")
  + empty_arr.join("") + "]```";
  return [return_str1, return_str2];
}

function levelUp(msg, f_record) {
  f_record[msg.author.id]["Level"] += 1;
  f_record[msg.author.id]["Experience"] = 0;
  let perks = (f_record[msg.author.id]["Level"] - 1)
    - f_record[msg.author.id]["Perks"].length;
  if (perks > 1) {
    var perk_note = `You have ${perks} perks available! Type ` + "`!f perks` to access.";
  } else if (perks > 0) {
    var perk_note = `You have ${perks} perk available! Type ` + "`!f perks` to access."
  }
  let fill = '\u200b';
  const attachment = new Discord.MessageAttachment(
    './scripts/fruitymon/assets/up_arrow.gif', 'up_arrow.gif'
  );
  const template = new Discord.MessageEmbed()
    .setColor('#0066FF')
    .setTitle("⬆️ " + msg.author.username + " Leveled Up! ⬆️")
    // .setDescription("*I'm proud of you.*")
    .attachFiles(attachment)
    .setThumbnail('attachment://up_arrow.gif')
    .addField("New Level", "`" + f_record[msg.author.id]["Level"] + "`", true)
    .addField("Exp. to Next Level", "`" + c.levels[f_record[msg.author.id]["Level"]] + "`", true)
    .addField("New Rank", "`" + c.ranks[f_record[msg.author.id]["Level"]] + "`", true)
    .addField("Note:", perk_note + fill, false)
  msg.reply(template);
  return f_record;
}

function updateFruitStats(msg, fruit_array, final_exp, f_record) {
  let str_array = c.fruit_arr_to_str_arr(fruit_array);
  let rare_count = c.count_rare_fruits(fruit_array);
  f_record[msg.author.id]["Experience"] = final_exp;
  f_record[msg.author.id]["Fruit Inventory"] =
    f_record[msg.author.id]["Fruit Inventory"].concat(str_array)
  f_record[msg.author.id]["Total Fruit Picked"] += fruit_array.length;
  f_record[msg.author.id]["Total Rare Fruits Picked"] += rare_count;
  f_record[msg.author.id]["Last Roll"] = msg.createdTimestamp;
  if (
    f_record[msg.author.id]["Perks"].includes("king_of_fruits")
    && str_array.includes("pineapple")
  ) {
    msg.channel.send("🍍 The King has Arrived! Pick again immediately! 🍍")
    f_record[msg.author.id]["Last Roll"] = msg.createdTimestamp - (1800*1000);
  }
  f_record[msg.author.id]["Current Channel"] = msg.channel.id;
  if (final_exp >= c.levels[f_record[msg.author.id]["Level"]]) {
    f_record = levelUp(msg, f_record);
  }
  return f_record;
}

function megaroll(msg) {
  let yr = msg.createdAt.getUTCFullYear()
  let mnth = ("0" + msg.createdAt.getUTCMonth()).slice(-2)
  let day = ("0" + msg.createdAt.getUTCDate()).slice(-2)
  let new_date = yr + "-" + mnth + "-" + day;
  if (f_record[msg.author.id]["Perks"].includes("king_of_trash")) {
    if ("Last Mega Date" in f_record[msg.author.id]) {
      if (new_date > f_record[msg.author.id]["Last Mega Date"]) {
        f_record[msg.author.id]["Last Mega Date"] = new_date;
        return true
      }
    } else {
      f_record[msg.author.id]["Last Mega Date"] = new_date;
      return true
    }
  }
  return false;
}



function pick(msg, content) {
  // Run Functions
  let [can_roll, wait] = canRoll(msg);
  if (can_roll) {
    let can_megaroll = megaroll(msg);
    let [keep, discard] = pickLogic(msg, can_megaroll);
    let keep_fruit = fruitArray(keep, msg);
    let discard_fruit = fruitArray(discard, msg);
    let keep_exp = generateExperience(msg, keep_fruit);
    let discard_exp = generateExperience(msg, discard_fruit);

    // Process Results
    let keep_fruit_str = c.fruit_arr_to_emoji_arr(keep_fruit).join(" ");
    let discard_fruit_str = c.fruit_arr_to_emoji_arr(discard_fruit).join(" ");
    let keep_exp_str = "`" + keep_exp.join(" + ") + "`\n";
    if (keep_exp_str.length > 990) {
      keep_exp_str = "Shortened: `..." + keep_exp_str.slice(-990)
    }
    let discard_exp_str = "`" + discard_exp.join(" + ") + " `\n";
    let keep_exp_ttl = "` = " + keep_exp.reduce((a, b) => a + b, 0) + "`" // Sum
    let discard_exp_ttl = "` = " + discard_exp.reduce((a, b) => a + b, 0) + "`"
    let curr_exp = f_record[msg.author.id]["Experience"];
    let curr_level = f_record[msg.author.id]["Level"];
    let exp_to_next = c.levels[curr_level];
    let new_exp = keep_exp.reduce((a, b) => a + b, 0);
    let exp_decimal = Math.min(1, ((new_exp + curr_exp) / exp_to_next))
    let [expb1, expb2] = generateExpBar(exp_decimal, curr_level);

    // Clean up discarded experience
    if (discard_exp.length === 0) {
      discard_exp_str = "";
      discard_exp_ttl = "";
    }

    // Assemble Embed
    let fill = '\u200b';
    const attachment = new Discord.MessageAttachment(
      './scripts/fruitymon/assets/fruit.gif', 'fruit.gif'
    );
    const template = new Discord.MessageEmbed()
      .setColor('#55FF55')
      .setTitle("🧺 ⬅️ 🍎 Fruit Picked! 🍎 ➡️ 🧺")
      .attachFiles(attachment)
      .setThumbnail('attachment://fruit.gif')
      .addField("Captured Fruit", keep_fruit_str, true)
      .addField("Discarded Fruit", fill + discard_fruit_str, true)
      // .addField(fill, fill, false)
      .addField(expb1, expb2, false)
      .addField("Captured Exp.", keep_exp_str + keep_exp_ttl, true)
      .addField("Discarded Exp.", fill + discard_exp_str + discard_exp_ttl, true)
      // .addField(expb1, expb2, false)
    msg.reply(template);
    if (can_megaroll) msg.channel.send("🎲Megaroll!🎲");
    // Update stats
    f_record = updateFruitStats(msg, keep_fruit, curr_exp + new_exp, f_record);
    fs.writeFile(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });

  } else {
    let minutes_and_seconds = f.secondsAndMinutes(wait)
    msg.reply(`Sorry pal, you need to wait ${minutes_and_seconds}!`);
  }
}


module.exports = { pick, generateExpBar };

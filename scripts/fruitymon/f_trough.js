"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const fruit_dict = require('./fruit_dict.json')
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
const Discord = require("discord.js");
const f_prices = require('./f_prices.js');
var f_record = require(record_filename);

// Functions
function f_autoTrough(msg) {
  let counter = 0;
  for (let i = f_record[msg.author.id]['Fruit Inventory'].length -1; i >= 0; i--) {
    let fruit_str = f_record[msg.author.id]['Fruit Inventory'][i];
    for(var trough_key in f_record[msg.author.id]['trough']) {
      if (fruit_str === trough_key) {
        f_record[msg.author.id]['trough'][trough_key]++;
        f_record[msg.author.id]['Fruit Inventory'].splice(i, 1);
        counter++;
      }
    }
  }
  msg.channel.send(`Success! You troughed \`${counter}\` item(s).`)
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

function f_troughInv(msg) {
  let dates = f_prices.generatePastDaysWithYears(8);
  let today = dates[dates.length - 1]
  let yday = dates[dates.length - 1 - 1]
  let lweek = dates[dates.length - 1 - 7]
  let body = "";
  let body2 = "";
  let body3 = "";
  let today_total = 0;
  let yday_total = 0;
  let lw_total = 0;
  for (const [key, qty] of Object.entries(f_record[msg.author.id]["trough"])) {
    let today_value = fruit_dict[key].hist_prices[today];
    let tier = fruit_dict[key].tier;
    console.log(`${key}: ${qty}`);
    body += `\`${fruit_dict[key].proper}\` ${fruit_dict[key].emoji} \`x${qty}\` - Hunger Value: \`${tier - 1}\`\n`
  }
  let desc = "Food trough!\n\n"

  const attachment = new Discord.MessageAttachment(
    './scripts/fruitymon/assets/foodbowl.png', 'foodbowl.png'
  );
  const embed = new Discord.MessageEmbed()
    .setTitle(` Your Trough `)
    .setColor("#88CC77")
    .setDescription(desc)
    .addField("Vault Items", body, false)
    .attachFiles(attachment)
    .setThumbnail('attachment://foodbowl.png');

  msg.channel.send(embed);
}


function f_trough(msg, content) {
  // Check if they even have a trough
  if (!("trough" in f_record[msg.author.id])) {
    msg.channel.send("You don't have a trough!")
    return;
  }

  // Check if they just wanna see trough inventory with !f trough
  if (content.split(" ")[0].trim().length === 0) {
    f_troughInv(msg)
    return;
  }

  // Check if they just wanna see trough inventory with !f trough
  if (content.trim() === "auto") {
    f_autoTrough(msg)
    return;
  }

  // Should be in the form !f trough item qty
  let split = content.split(" ").filter(Boolean);
  let fruit_str = ""
  let qty = 0

  // ID Fruit
  if (split[0].trim() in c.emoji_to_string) {
    fruit_str = c.emoji_to_string[split[0].trim()];
  } else if (split[0].trim() in fruit_dict) {
    fruit_str = split[0].trim()
  } else if (split[0].trim().toUpperCase() in c.ticker_to_string) {
    fruit_str = c.ticker_to_string[split[0].trim().toUpperCase()].str;
  } else {
    msg.channel.send("You need to specify a valid fruit!")
    return ;
  }

  // Check that fruit isn't yucky
  if ([0, 1, 6, 7, 8].includes(fruit_dict[fruit_str].tier)) {
    msg.channel.send("Either the animals will find that yucky or that item should be used for healing.")
    return ;
  }

  // ID Quantity
  let actual_qty = 0;
  for (let i = 0; i < f_record[msg.author.id]["Fruit Inventory"].length; i++) {
    if (f_record[msg.author.id]["Fruit Inventory"][i] === fruit_str) {
      actual_qty++;
    }
  }
  if (split.length === 1 || split[1].trim() === "all") {
    qty = actual_qty;
  } else if (f.isNumeric(split[1].trim())) {
    qty = Math.min(parseInt(split[1].trim(), 10), actual_qty);
  }
  if (qty <= 0) {
    msg.channel.send("You need to specify a valid quantity!")
    return ;
  }

  // Check that trough isn't full, add key to trough
  if (Object.keys(f_record[msg.author.id]["trough"]).length >= 10) {
    msg.channel.send("Your trough is full! Try removing some stuff first. Remember, it can only hold 10 unique fruit.")
    return ;
  } else if (!(fruit_str in f_record[msg.author.id]["trough"])) {
    f_record[msg.author.id]["trough"][fruit_str] = 0;
  }

  // Remove fruit and add to trough
  let rem_qty = qty;
  for (let i = f_record[msg.author.id]["Fruit Inventory"].length - 1; i >= 0; i--) {
    if (f_record[msg.author.id]["Fruit Inventory"][i] === fruit_str && rem_qty > 0) {
      f_record[msg.author.id]["Fruit Inventory"].splice(i, 1);
      f_record[msg.author.id]["trough"][fruit_str]++;
      rem_qty--;
    }
  }

  // Save
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });

  msg.channel.send(`Success! You successfully troughed \`${qty}\` ${fruit_dict[fruit_str].emoji}!`)
}


function f_untrough(msg, content) {
  // Check if they even have a vault
  if (!("trough" in f_record[msg.author.id])) {
    msg.channel.send("You don't have a trough!")
    return;
  }

  // Should be in the form !f unvault item qty
  let split = content.split(" ").filter(Boolean);
  let fruit_str = ""
  let qty = 0

  // ID Fruit
  if (split[0].trim() in c.emoji_to_string) {
    fruit_str = c.emoji_to_string[split[0].trim()];
  } else if (split[0].trim() in fruit_dict) {
    fruit_str = split[0].trim()
  } else if (split[0].trim().toUpperCase() in c.ticker_to_string) {
    fruit_str = c.ticker_to_string[split[0].trim().toUpperCase()].str;
  } else {
    msg.channel.send("You need to specify a valid fruit!")
    return ;
  }

  // Check that fruit is actually in trough
  if (!(fruit_str in f_record[msg.author.id]["trough"])) {
    msg.channel.send("That's not even in your trough!")
    return ;
  }

  // ID Quantity
  let actual_qty = f_record[msg.author.id]["trough"][fruit_str];
  if (split.length < 2) {
    msg.channel.send("You need to specify a valid quantity!")
    return ;
  }
  if (split[1].trim() === "all") {
    qty = actual_qty;
  } else if (f.isNumeric(split[1].trim())) {
    qty = Math.min(parseInt(split[1].trim(), 10), actual_qty);
  }
  if (qty <= 0) {
    msg.channel.send("You need to specify a valid quantity!")
    return ;
  }

  // Remove fruit from trough, add to inventory
  for (let i = 0; i < qty; i++) {
    f_record[msg.author.id]["trough"][fruit_str]--;
    f_record[msg.author.id]["Fruit Inventory"].push(fruit_str);
  }

  // Delete key if necessary
  if (f_record[msg.author.id]["trough"][fruit_str] === 0) {
    delete f_record[msg.author.id]["trough"][fruit_str];
  }

  // Save
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });

  msg.channel.send(`Success! You successfully untroughed \`${qty}\` ${fruit_dict[fruit_str].emoji}!`)
}

module.exports = {f_trough, f_untrough}

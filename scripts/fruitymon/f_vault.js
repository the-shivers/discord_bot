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
function f_autoVault(msg) {
  let counter = 0;
  for (let i = f_record[msg.author.id]['Fruit Inventory'].length -1; i >= 0; i--) {
    let fruit_str = f_record[msg.author.id]['Fruit Inventory'][i];
    for(var vault_key in f_record[msg.author.id]['vault']) {
      if (fruit_str === vault_key) {
        f_record[msg.author.id]['vault'][vault_key]++;
        f_record[msg.author.id]['Fruit Inventory'].splice(i, 1);
        counter++;
      }
    }
  }
  msg.channel.send(`Success! You vaulted \`${counter}\` item(s).`)
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

function f_vaultInv(msg) {
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
  for (const [key, qty] of Object.entries(f_record[msg.author.id]["vault"])) {
    let today_value = fruit_dict[key].hist_prices[today];
    let yday_value = fruit_dict[key].hist_prices[yday];
    let lw_value = fruit_dict[key].hist_prices[lweek];
    let yday_pct = 100 * (today_value - yday_value) / yday_value;
    let lw_pct = 100 * (today_value - lw_value) / lw_value;
    today_total += qty * today_value;
    yday_total += qty * yday_value;
    lw_total += qty * lw_value;
    console.log(`${key}: ${qty}`);
    body += `\`${fruit_dict[key].ticker}\` ${fruit_dict[key].emoji} \`x${qty}\` @ \`₣${today_value.toFixed(2)}\` = \`₣${(today_value * qty).toFixed(2)}\`\n`
    body2 += `\`${fruit_dict[key].ticker}\` ${fruit_dict[key].emoji} \`₣${yday_value.toFixed(2)}\` \`(${yday_pct.toFixed(2)}%)\`\n`
    body3 += `\`${fruit_dict[key].ticker}\` ${fruit_dict[key].emoji} \`₣${lw_value.toFixed(2)}\` \`(${lw_pct.toFixed(2)}%)\`\n`
  }
  let yday_total_pct = 100 * (today_total - yday_total) / yday_total;
  let lw_total_pct = 100 * (today_total - lw_total) / lw_total;
  let desc = "Shows the current value of your vault, as well as the value its contents would be worth using historical prices.\n\n"
  desc += `Currently, the value of your vault is: \`₣${today_total.toFixed(2)}\`\n`
  desc += `Relative to yesterday: \`₣${yday_total.toFixed(2)}\` \`(${yday_total_pct.toFixed(2)}%)\`\n`
  desc += `Relative to last week: \`₣${lw_total.toFixed(2)}\` \`(${lw_total_pct.toFixed(2)}%)\``

  const attachment = new Discord.MessageAttachment(
    './scripts/fruitymon/assets/piggybank.gif', 'piggybank.gif'
  );
  const embed = new Discord.MessageEmbed()
    .setTitle(`💰 Your Vault 💰`)
    .setColor("#88CC77")
    .setDescription(desc)
    .addField("Vault Items", body, false)
    .addField("Prices Compared to Yesterday", body2, true)
    .addField("Prices Compared to Last Week", body3, true)
    .attachFiles(attachment)
    .setThumbnail('attachment://piggybank.gif');

  msg.channel.send(embed);
}


function f_vault(msg, content) {
  // Check if they even have a vault
  if (!("vault" in f_record[msg.author.id])) {
    msg.channel.send("You don't have a vault!")
    return;
  }

  // Check if they just wanna see vault inventory with !f vault
  if (content.split(" ")[0].trim().length === 0) {
    f_vaultInv(msg)
    return;
  }

  // Check if they just wanna see vault inventory with !f vault
  if (content.trim() === "auto") {
    f_autoVault(msg)
    return;
  }

  // Should be in the form !f vault item qty
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

  // Check that vault isn't full, add key to vault
  if (Object.keys(f_record[msg.author.id]["vault"]).length >= 10) {
    msg.channel.send("Your vault is full! Try removing some stuff first. Remember, it can only hold 10 unique fruit.")
    return ;
  } else if (!(fruit_str in f_record[msg.author.id]["vault"])) {
    f_record[msg.author.id]["vault"][fruit_str] = 0;
  }

  // Remove fruit and add to vault
  let rem_qty = qty;
  for (let i = f_record[msg.author.id]["Fruit Inventory"].length - 1; i >= 0; i--) {
    if (f_record[msg.author.id]["Fruit Inventory"][i] === fruit_str && rem_qty > 0) {
      f_record[msg.author.id]["Fruit Inventory"].splice(i, 1);
      f_record[msg.author.id]["vault"][fruit_str]++;
      rem_qty--;
    }
  }

  // Save
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });

  msg.channel.send(`Success! You successfully vaulted \`${qty}\` ${fruit_dict[fruit_str].emoji}!`)
}


function f_unvault(msg, content) {
  // Check if they even have a vault
  if (!("vault" in f_record[msg.author.id])) {
    msg.channel.send("You don't have a vault!")
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

  // Check that fruit is actually in vault
  if (!(fruit_str in f_record[msg.author.id]["vault"])) {
    msg.channel.send("That's not even in your vault!")
    return ;
  }

  // ID Quantity
  let actual_qty = f_record[msg.author.id]["vault"][fruit_str];
  if (split[1].trim() === "all") {
    qty = actual_qty;
  } else if (f.isNumeric(split[1].trim())) {
    qty = Math.min(parseInt(split[1].trim(), 10), actual_qty);
  }
  if (qty <= 0) {
    msg.channel.send("You need to specify a valid quantity!")
    return ;
  }

  // Remove fruit from vault, add to inventory
  for (let i = 0; i < qty; i++) {
    f_record[msg.author.id]["vault"][fruit_str]--;
    f_record[msg.author.id]["Fruit Inventory"].push(fruit_str);
  }

  // Delete key if necessary
  if (f_record[msg.author.id]["vault"][fruit_str] === 0) {
    delete f_record[msg.author.id]["vault"][fruit_str];
  }

  // Save
  fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });

  msg.channel.send(`Success! You successfully unvaulted \`${qty}\` ${fruit_dict[fruit_str].emoji}!`)
}

module.exports = {f_vault, f_unvault}

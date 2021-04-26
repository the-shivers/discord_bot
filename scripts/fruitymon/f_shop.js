"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const stock_filename = './f_shop.json';
const stock_filename_full = './scripts/fruitymon/f_shop.json';
var stock = require(stock_filename);
const Discord = require('discord.js');
const fruit_dict = require('./fruit_dict.json')
const f_prices = require('./f_prices.js');

const trash_day = 3;

function updateStock() {
  // activates on any shop activity (buy, sell, shop)
  let today = new Date();
  let month = ("0" + (today.getUTCMonth() + 1)).slice(-2);
  let day = ("0" + today.getUTCDate()).slice(-2);
  let year = today.getUTCFullYear();
  let curr_date = year + "-" + month + "-" + day
  if (stock.last_updated_at !== curr_date) {
    stock.last_updated_at = curr_date;
    for (const key of Object.keys(fruit_dict)) {
      if ([0, 1].includes(fruit_dict[key].tier)) {
        stock.stock[key] = 0
      } else if (fruit_dict[key].tier === 2) {
        stock.stock[key] = 20;
      } else if (fruit_dict[key].tier === 3) {
        stock.stock[key] = 10;
      } else if (fruit_dict[key].tier === 4) {
        stock.stock[key] = 5;
      } else if (fruit_dict[key].tier === 5) {
        stock.stock[key] = 3;
      } else if (fruit_dict[key].tier === 6) {
        stock.stock[key] = 1;
      }
    }
    fs.writeFileSync(stock_filename_full, JSON.stringify(stock, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
  }
}

function generatePrices(msg, ind) {
  let return_str = '';
  let fruit_tier = c.fruit_tiers[ind]
  for (let i = 0; i < fruit_tier.fruit.length; i++) {
    let curr_fruit_str = fruit_tier.fruit_str[i];
    return_str += fruit_tier.fruit[i] + " `₣" + priceFruit(curr_fruit_str, msg).toFixed(2)
    return_str += "` x" + stock.stock[curr_fruit_str] + "\n"
  }
  return return_str;
}

function priceFruit(fruit_str, msg) {
  let fruit = fruit_dict[fruit_str];
  let date_str = f_prices.generatePastDaysWithYears(1)[0];
  let base_price = fruit.hist_prices[date_str];
  let trash_tiers = [0, 1];
  let rare_tiers = [5, 6];
  if (
    (trash_tiers.includes(fruit.tier) && f_record[msg.author.id]["Perks"].includes("pawnstar")) ||
    (rare_tiers.includes(fruit.tier) && f_record[msg.author.id]["Perks"].includes("beloved"))
  ) {
    return base_price * 2;
  }
  return base_price;
}

function generateItems(msg) {
  // Generates items for a particular user
  let item_arr = [];
  if (f_record[msg.author.id]["Perks"].includes("greedy")) {
    item_arr = generateGreedyItems();
  } else if (f_record[msg.author.id]["Perks"].includes("lucky")) {
    item_arr = generateLuckyItems();
  }
  return item_arr;
}

function generateGreedyItems() {
  let item_arr = [];
  item_arr = item_arr.concat(
    new c.Item("deperker"),
    new c.Item("lock"),
    new c.Item("megagreed")
  )
  return item_arr;
}

function generateLuckyItems() {
  let item_arr = [];
  item_arr = item_arr.concat(
    new c.Item("deperker"),
    new c.Item("lock"),
    new c.Item("megaluck")
  )
  return item_arr;
}

function prettifyItems(item_arr) {
  let return_str = "";
  for (let i = 0; i < item_arr.length; i++) {
    return_str += "`" + item_arr[i].name + "` `(₣" + item_arr[i].price.toFixed(2) + ")` - "
    return_str += item_arr[i].desc + "\n"
  }
  return return_str;
}

function f_shop(msg, content) {
  // Assemble attachment
  updateStock()
  const template = new Discord.MessageEmbed()
  const attachment = new Discord.MessageAttachment(
    './scripts/fruitymon/assets/fruit_stand.gif', 'fruit_stand.gif'
  );
  var description = "Welcome! To sell, try one of the following options:\n\n"
  + "Sell one type of fruit: `!f sell <fruit emoji> <quantity>`\n"
  + "Sell all of one tier: `!f sell <tier number>`\n"
  + "Sell all: `!f sell all`\n"
  + "Buy fruit `!f buy <fruit emoji> <quantity>`"
  template.attachFiles(attachment);
  template.setThumbnail('attachment://fruit_stand.gif');
  template
    .setColor('#FFDD55')
    .setTitle("The Fruit Shop is now in business!")
    .setDescription(description)
    for(var i = 0; i < c.fruit_tiers.length; i++) {
      template.addField((i) + ". " + c.fruit_tiers[i].name, generatePrices(msg, [i]), true);
    }
    let buy_items = prettifyItems(generateItems(msg));
    template.addField(
      "Items:\n",
      "To buy, try `!f buy <item_name>`\nYou have `₣" + f_record[msg.author.id]["Fruitbux"].toFixed(2) + "` to buy with.\n\n" + buy_items,
      false
    );
  msg.channel.send(template);
}

function f_sell(msg, content) {
  let inv = f_record[msg.author.id]["Fruit Inventory"];
  let val = 0;
  let tfs = 0;
  let trfs = 0;
  let success = false;
  var d = new Date();
  var n = d.getDay()
  // Parse the message, starting by removing blank strings from double spaces
  content = content.split("  ").join(" ");
  // Identify what they want, then choose how to proceed.
  if (content === "all") {
    for (let i = 0; i < inv.length; i++) {
      success = true;
      // let curr_fruit = new c.Fruit(inv[i]);
      let curr_fruit = fruit_dict[inv[i]]
        tfs++;
      if (curr_fruit.tier === 6) {
        trfs++;
      }
      stock.stock[curr_fruit.str]++;
      val += priceFruit(curr_fruit.str, msg);
    }
    inv = []
  } else if ( // Check if they sold an entire tier
    f.isNumeric(content.split(' ')[0]) &&
    parseInt(content.split(' ')[0]) < 7 &&
    parseInt(content.split(' ')[0]) >= 0
  ) {
    let rem_list = [];
    for (let i = 0; i < inv.length; i++) {
      var curr_fruit = fruit_dict[inv[i]];
      if (curr_fruit.tier == parseInt(content.split(' ')[0])) {
        val += priceFruit(curr_fruit.str, msg);
        stock.stock[curr_fruit.str]++;
        rem_list = rem_list.concat([i]);
      }
    }
    for (var i = rem_list.length -1; i >= 0; i--) {
      inv.splice(rem_list[i],1);
      success = true
    }
    tfs += rem_list.length;
    if (parseInt(content.split(' ')[0]) === 6) {
      trfs += rem_list.length;
    }
  } else if ( // check if they sold a number of an emoji
    content.split(' ')[0] in c.emoji_to_string &&
    f.isNumeric(content.split(' ')[1])
  ) {
    let rem_list = [];
    for (let i = 0; i < inv.length; i++) {
      var curr_fruit = fruit_dict[inv[i]];
      if (curr_fruit.emoji == content.split(' ')[0]) {
        rem_list = rem_list.concat([i]);
      }
    }
    for (var i = Math.min(rem_list.length,parseInt(content.split(' ')[1]))-1; i >= 0; i--) {
      var myfruit = fruit_dict[inv[rem_list[i]]];
      val += priceFruit(myfruit.str, msg);
      console.log(stock.stock);
      console.log(myfruit.str);
      stock.stock[myfruit.str]++;
      inv.splice(rem_list[i],1);
      success = true
    }
    tfs += Math.min(rem_list.length,parseInt(content.split(' ')[1]));
    if (curr_fruit.tier === 6) {
      trfs += Math.min(rem_list.length,parseInt(content.split(' ')[1]));
    }
  }
  if (success) {
    f_record[msg.author.id]["Fruit Inventory"] = inv;
    f_record[msg.author.id]["Fruitbux"] += val;
    f_record[msg.author.id]["Total Fruitbux Earned"] += val;
    f_record[msg.author.id]["Total Fruit Sold"] += tfs;
    f_record[msg.author.id]["Total Rare Fruit Sold"] += trfs;
    msg.channel.send("Congrats on your sale! You made `₣" + val.toFixed(2) + "`")
    fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
    fs.writeFileSync(stock_filename_full, JSON.stringify(stock, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
  } else {
    success = false;
    msg.channel.send("You either didn't have what you wanted to sell, or entered the command wrong. Sorry bro!");
  }
}

function f_buy(msg, content) {
  updateStock()
  let date_str = f_prices.generatePastDaysWithYears(1)[0];
  let buy_items = generateItems(msg);
  let return_msg = "That item isn't available (for you)!";
  // Check if the item is an emoji! Or string! Copy from chart:
  let fruit_str = '';
  let split_contents = content.split(' ').filter(Boolean)
  let first_part = split_contents[0]
  if (first_part.trim() in c.emoji_to_string) {
    fruit_str = c.emoji_to_string[first_part.trim()];
  } else if (first_part.trim() in fruit_dict) {
    fruit_str = first_part.trim()
  } else if (first_part.trim() in c.ticker_to_string) {
    fruit_str = c.ticker_to_string[first_part.trim()].str;
  }
  if (fruit_str !== '') {
    // check if fruit is in stock
    if (stock.stock[fruit_str] === 0) {
      msg.reply("That's out of stock!")
      return ;
    }
    // Determine how much they want
    let qty = 1;
    if (f.isNumeric(split_contents[1])) {
      qty = parseInt(split_contents[1])
    }
    let true_qty = Math.min(qty, stock.stock[fruit_str]);
    // Determine if they can afford it based on original quantity
    let price = fruit_dict[fruit_str].hist_prices[date_str]
    if (f_record[msg.author.id]["Fruitbux"] < price * qty) {
      msg.reply("You can't afford it!")
      return ;
    }
    // Complete the purchase
    let val = 0
    for (let i = 0; i < true_qty; i++) {
      val += price;
      f_record[msg.author.id]["Fruitbux"] -= price;
      f_record[msg.author.id]["Fruit Inventory"].push(fruit_str);
      stock.stock[fruit_str]--;
    }

    msg.reply(`Success! You bought \`${true_qty}\` ${fruit_dict[fruit_str].emoji} for \`₣${(price * true_qty).toFixed(2)}\`!`)
    fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
    fs.writeFileSync(stock_filename_full, JSON.stringify(stock, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
    return;
  }
  // Check if item is available
  for (let i = 0; i < buy_items.length; i++) {
    if (content === buy_items[i].name) {
      // Check if they can afford it
      if (f_record[msg.author.id]["Fruitbux"] >= buy_items[i].price) {
        return_msg = "You bought `" + buy_items[i].name + "` for `₣" + buy_items[i].price.toFixed(2) + "`";
        // Update stats
        f_record[msg.author.id]["Fruitbux"] -= buy_items[i].price
        f_record[msg.author.id]["Item Inventory"] =
          f_record[msg.author.id]["Item Inventory"].concat(
            {"name": buy_items[i].name, "date": msg.createdTimestamp}
          );
        if (buy_items[i].name == 'deperker') {
          f_record[msg.author.id]["Perks"] = [];
          f_record[msg.author.id]["Pick Limit"] = 5;
          f_record[msg.author.id]["Number of Dice"] = 5;
          f_record[msg.author.id]["Dice Sides"] = 100;
        }
        fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
          if (err) return console.log(err);
        });
      } else {
        return_msg = "You're too poor!";
      }
    }
  }
  msg.channel.send(return_msg);
}

module.exports = {f_shop, f_sell, f_buy};

"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const Discord = require('discord.js');

const trash_day = 3;

function generatePrices(msg, ind) {
  let return_str = '';
  let fruit_tier = c.fruit_tiers[ind]
  for (let i = 0; i < fruit_tier.fruit.length; i++) {
    let curr_fruit = new c.Fruit(fruit_tier.fruit_str[i]);
    return_str += fruit_tier.fruit[i] + " `₣" + priceFruit(curr_fruit, msg) + ".00`\n"
  }
  return return_str;
}

function priceFruit(fruit, msg) {
  var d = new Date();
  var n = d.getDay()
  let trash_tiers = [0, 1];
  let rare_tiers = [5, 6];
  if (trash_tiers.includes(fruit.tier)) {
    if (f_record[msg.author.id]["Perks"].includes("pawnstar")) {
      return fruit.exp * 2;
    } else if (n === trash_day) {
      return fruit.exp;
    } else {
      return 0;
    }
  } else {
    if (n === trash_day) {
      return 0;
    } else {
      if (f_record[msg.author.id]["Perks"].includes("beloved") && rare_tiers.includes(fruit.tier)) {
        console.log(fruit);
        return fruit.exp * 2;
      } else {
        return fruit.exp;
      }
    }
  }
}


  // if (f_record[msg.author.id]["Perks"].includes("pawnstar") && trash_tiers.includes(fruit.tier)) {
  //   return fruit.exp * 2
  // } else if (trash_tiers.includes(fruit.tier)) {
  //   if (n === trash_day) {
  //     return fruit.exp
  //   }
  // }
  //
  //
  // if (n === trash_day || f_record[msg.author.id]["Perks"].includes("pawnstar")) {
  //   if (fruit.tier === 1 || fruit.tier === 0) {
  //     return fruit.exp * 2;
  //   }
  // }
  // if (n === trash_day) {
  //   if (fruit.tier !== 1) {
  //     return 0;
  //   }
  // } else {
  //   if (fruit.tier === 1) {
  //     return 0;
  //   }
  // }
  // return fruit.exp;
// }

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
    new c.Item("megagreed")
  )
  return item_arr;
}

function generateLuckyItems() {
  let item_arr = [];
  item_arr = item_arr.concat(
    new c.Item("megaluck")
  )
  return item_arr;
}

function prettifyItems(item_arr) {
  let return_str = "";
  for (let i = 0; i < item_arr.length; i++) {
    return_str += "`" + item_arr[i].name + "` `(₣" + item_arr[i].price + ".00)` - "
    return_str += item_arr[i].desc + "\n"
  }
  return return_str;
}

function f_shop(msg, content) {
  // Assemble attachment
  const template = new Discord.MessageEmbed()
  let rare_trash_msg = '\u200b';
  if (f_record[msg.author.id]["Perks"].includes('raccoon')) {
    rare_trash_msg = "\n\nYou smell like you might have some rare trash! Sell it the same way you'd sell any other specific emoji."
  }
  var d = new Date();
  var n = d.getDay()
  if (n === trash_day) {
    const attachment = new Discord.MessageAttachment(
      './scripts/fruitymon/assets/possum.gif', 'possum.gif'
    );
    var name = "TRASH"
    var description = "ITS TEH TRASH STORE!!!!\n\n"
    + "Sell one type of TRASH: `!f sell <TRASH emoji> <quantity>`\n"
    + "Sell all of TRASH tier: `!f sell 1`\n"
    template.attachFiles(attachment);
    template.setThumbnail('attachment://possum.gif');
  } else {
    const attachment = new Discord.MessageAttachment(
      './scripts/fruitymon/assets/fruit_stand.gif', 'fruit_stand.gif'
    );
    var name = "Fruit"
    var description = "Welcome! To sell, try one of the following options:\n\n"
    + "Sell one type of fruit: `!f sell <fruit emoji> <quantity>`\n"
    + "Sell all of one tier: `!f sell <tier number>`\n"
    + "Sell all: `!f sell all`" + rare_trash_msg
    template.attachFiles(attachment);
    template.setThumbnail('attachment://fruit_stand.gif');
  }
  template
    .setColor('#FFDD55')
    .setTitle("The " + name + " Shop is now in business!")
    .setDescription(description)
    for(var i = 0; i < c.fruit_tiers.length; i++) {
      template.addField((i + 1) + ". " + c.fruit_tiers[i].name, generatePrices(msg, [i]), true);
    }
    let buy_items = prettifyItems(generateItems(msg));
    template.addField(
      "Items:\n",
      "To buy, try `!f buy <item_name>`\nYou have `₣" + f_record[msg.author.id]["Fruitbux"] + ".00` to buy with.\n\n" + buy_items,
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
  if (content === "all" && n !== trash_day) {
    for (let i = 0; i < inv.length; i++) {
      success = true;
      let curr_fruit = new c.Fruit(inv[i]);
        tfs++;
      if (curr_fruit.tier === 6) {
        trfs++;
      }
      val += priceFruit(curr_fruit, msg);
    }
    inv = []
  } else if ( // Check if they sold an entire tier
    f.isNumeric(content.split(' ')[0]) &&
    (
      n === trash_day && parseInt(content.split(' ')[0]) === 1
    ) ||
    (
      n !== trash_day &&
      parseInt(content.split(' ')[0]) < 7 &&
      parseInt(content.split(' ')[0]) > 0
    )
  ) {
    let rem_list = [];
    for (let i = 0; i < inv.length; i++) {
      var curr_fruit = new c.Fruit(inv[i]);
      if (curr_fruit.tier == parseInt(content.split(' ')[0])) {
        val += priceFruit(curr_fruit, msg);
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
      var curr_fruit = new c.Fruit(inv[i]);
      if (curr_fruit.emoji == content.split(' ')[0]) {
        // val += priceFruit(curr_fruit, msg);
        rem_list = rem_list.concat([i]);
      }
    }
    for (var i = Math.min(rem_list.length,parseInt(content.split(' ')[1]))-1; i >= 0; i--) {
      var myfruit = new c.Fruit(inv[rem_list[i]]);
      console.log("my fruit!", myfruit);
      console.log("val begin", val)
      val += priceFruit(myfruit, msg);
      console.log("val end", val)
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
    msg.channel.send("Congrats on your sale! You made `₣" + val + "`")
    fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
  } else {
    success = false;
    msg.channel.send("You either didn't have what you wanted to sell, or entered the command wrong. Sorry bro!");
  }
}

function f_buy(msg, content) {
  let buy_items = generateItems(msg);
  let return_msg = "That item isn't available (for you)!";
  // Check if item is available
  for (let i = 0; i < buy_items.length; i++) {
    if (content === buy_items[i].name) {
      // Check if they can afford it
      if (f_record[msg.author.id]["Fruitbux"] >= buy_items[i].price) {
        return_msg = "You bought `" + buy_items[i].name + "` for `₣" + buy_items[i].price + ".00`";
        // Update stats
        f_record[msg.author.id]["Fruitbux"] -= buy_items[i].price
        f_record[msg.author.id]["Item Inventory"] =
          f_record[msg.author.id]["Item Inventory"].concat(
            {"name": buy_items[i].name, "date": msg.createdTimestamp}
          );
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

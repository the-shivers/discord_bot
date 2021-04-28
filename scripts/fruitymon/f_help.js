"use strict";

function f_help(msg, content) {
  let result = "";
  result += "Every fruitymon command starts with !f followed by a command and possibly options.\n"
  + "**!f help** - *Shows you this.*\n"
  + "**!f tiers** - *Shows you what fruits are common/rare.*\n"
  + "**!f inventory** - *Shows you what you've picked so far!*\n"
  + "**!f stats** - *Shows your key fruitymon stats, like your level, perks, and stuff.*\n"
  + "**!f pick** - *Picks fruit!*\n"
  + "**!f reset** - *Permanently resets your Fruitymon career. Back to level 1 with no fruit!*\n"
  + "**!f perks** - *If you have perks available from leveling up, this lets you look at what you can choose!*\n"
  + "**!f perks tree** - *See the perks tree.*\n"
  + "**!f shop** - *Shows the fruit shop! Note: it may change on a day-to-day basis, so check before buying or seling.*\n"
  + "**!f chart <fruit emoji/fruit name/ticker>** - *Shows historical prices for a fruit.*\n"
  + "**!f chart <integer>d** - *Shows best and worst performing fruit comparing today to that many days ago. Try \"!f chart 7d\"*\n"
  + "**!f steal <@mention>** - *Steal five random fruit from someone else. This is unlimited, so try not to piss too many people off.*\n"
  + "**!f steal_m <@mention>** - *Steal 500 Fruitbux from someone else. This is unlimited, so try not to piss too many people off.*\n"
  + "**!f give <@mention> <fruit_emoji> <quantity>** - *Give some of your fruit or trash to someone!*\n"
  + "**!f give_m <@mention> <quantity>** - *Give some of your Fruitbux to someone!*\n"
  + "**!f vault** - *Shows how much your vault is worth.*\n"
  + "**!f vault <fruit> <qty/all>** - *Takes some items from your inventory and puts them in your vault.*\n"
  + "**!f vault auto** - *Automatically adds items from your inventory to your vault.*\n"
  + "**!f unvault <fruit> <qty/all>** - *Takes some items from your vault and puts them in your inventory.*\n"
  + "**!f petshop** - *See what pets are available to buy.*\n"
  + "**!f pettiers** - *See what pets exist and how rare they are.*\n"
  + "**!f petinv** - *See your pets and what you can do with them.*\n"
  msg.channel.send(result);
}

module.exports = { f_help };

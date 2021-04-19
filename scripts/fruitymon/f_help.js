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
  msg.channel.send(result);
}

module.exports = { f_help };

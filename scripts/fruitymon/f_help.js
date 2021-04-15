"use strict";

function f_help(msg, content) {
  let result = "";
  result += "Every fruitymon command starts with !f followed by a command and possibly options.\n"
  + "**!f help** - *Shows you this.*\n"
  + "**!f tiers** - *Shows you what fruits are common/rare.*\n"
  + "**!f inventory** - *Shows you what you've picked so far!*\n"
  + "**!f pick [integer]** - *Picks fruit! You get rarer fruit if you don't pick as many. TO DO: make this a thing cuz rn its not*\n"
  msg.channel.send(result);
}

module.exports = { f_help };

"use strict";

function say(msg, content) {
  if (msg.author.id !== "790037139546570802") {
    msg.reply("You aren't the boss of me!");
    return ;
  }
  msg.channel.send(content.split(' ').slice(1).join(' '));
}

module.exports = {say};

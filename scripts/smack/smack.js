"use strict";

// Define Constants and key Variables
const f = require('../../funcs.js');
const fs = require('fs');
const smack_json = JSON.parse(
  fs.readFileSync('scripts/smack/smack.json', 'utf8')
);

async function smack(msg, content) {
  if (
    msg.mentions.users.size === 1
    && content.split(' ').length > 1
  ) {
    let user_id = msg.mentions.users.first().id;
    let split_content = content.split(" ");
    if (split_content[1] === "<@!" + user_id + ">") {

      let smack_info = {};
      Object.keys(smack_json).forEach(function(key) {
        var value = smack_json[key];
        smack_info[key] = value[Math.floor(Math.random() * value.length)];
      })

      msg.channel.send(
        "*" + smack_info.adverb + " " + smack_info.verb + " " + "<@!" + user_id
        + "> " + smack_info.body_part + " with " + smack_info.weapon + "! ("
        + f.rollDie(20) + "/20)*"
      );

    }
  } else {
    msg.channel.send("ouch. :(");
  }
}

module.exports = { smack };

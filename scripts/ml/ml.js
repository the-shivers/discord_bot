"use strict";

// Imports
//const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './ml.json';
const record_filename_full = './scripts/ml/ml.json';
var ml_json = require(record_filename);


async function getGuildMember(msg, user) {
  return msg.guild.members.fetch(user.id);
}

async function getGuildMembers(msg) {
  console.log("In getGuildMembers");
  return msg.guild.members.fetch();
}

async function ml(msg, content) {
  let server_ml = ml_json[msg.guild.id];
  let rem_content = content.split(' ').slice(1).join(' ');
  let random_key = Math.floor(server_ml.length * Math.random()).toString();
  let ml_msg = server_ml[random_key].message
  if (ml_msg.includes("$target")) {
    //console.log(content.split)
    //branch for replacing target with target or random
    if (msg.mentions.users.size > 0) {
      let mentioned = await getGuildMember(msg, msg.mentions.users.first())
      ml_msg = ml_msg.split("$target").join(mentioned.displayName);
    } else if (content.split(' ').length > 1) {
      let repl_str = content.split(' ').slice(1).join(" ");
      ml_msg = ml_msg.split("$target").join(repl_str);
    } else {
      // replace target with random logic
      let guild_ppl = await getGuildMembers(msg);
      let winner = guild_ppl.random();
      let rand_memb = await getGuildMember(msg, winner);
      ml_msg = ml_msg.split("$target").join(rand_memb.displayName);
    }
  }
  if (ml_msg.includes("$random")) {
    let guild_ppl = await getGuildMembers(msg);
    let winner = guild_ppl.random();
    let rand_memb = await getGuildMember(msg, winner);
    ml_msg = ml_msg.split("$random").join(rand_memb.displayName);
  }
  if (ml_msg.includes("$user")) {
    //replace user with user logic
    let author = msg.author;
    let author_user = await getGuildMember(msg, author);
    ml_msg = ml_msg.split("$user").join(author_user.displayName);
  }
  msg.channel.send(ml_msg);
}

function mladd(msg, content) {
  if (msg.author.id === "243314148698619905" || msg.author.id === "340310812952363009" || msg.author.id === "831357409192443905") {
    msg.channel.send("fuck off bird!");
  } else {
    msg.channel.send("add this: BRAAAAAAAAAAAAAAAAAAP");
    let message = content.split(' ').slice(1).join(' ');
    let author = msg.author.id;

    if (1 === 1) { //This is the condition that determines if it can be added.

      ml_json[msg.guild.id] =  ml_json[msg.guild.id].concat({"author": author, "message": message})
      fs.writeFile(record_filename_full, JSON.stringify(ml_json, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
      })

    } else {

      msg.channel.send("do it right bitch");

    }
  }
}

module.exports = { ml,
  mladd
}

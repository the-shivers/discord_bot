"use strict";

// Imports
const Discord = require("discord.js");
const fs = require('fs');
const auth = require("./auth.json");
const f = require('./funcs.js');
const b = require('./funcs.js');
const command_dict = require('./command_dict.js').command_dict;
const bot = new Discord.Client();
const trig = "!";

// Live bot behavior
bot.login(auth.token);
bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  f.backup(
    "backups",
    [
      "./scripts/fruitymon/f_record.json",
      "./scripts/fruitymon/fruit_dict.json",
      "./scripts/ml/ml.json"
    ]
  );
  console.log("Backed up files.")
});

bot.on("message", async msg => {
  if (msg.content.startsWith(trig)) {
    let content = msg.content.substring(msg.content.indexOf(trig)+1);
    let command = content.split(' ')[0];
    if (command in command_dict) {
      console.log(command_dict[command].log);
      command_dict[command].func(msg, content);
    } else {
      msg.channel.send("That's not a real command dude.")
    }
  }
});

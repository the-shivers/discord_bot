"use strict";

// Imports
// var rpg_vars = require('./rpg_vars.js');

// Define Constants
const Discord = require("discord.js");
const request = require("request");
const fs = require('fs');
const Canvas = require('canvas');
const glob = require( 'glob' );
const path = require( 'path' );

const auth = require("./auth.json");
const f = require('./funcs.js');
const tarot = require('./scripts/tarot/tarot.js');
const rpg = require('./scripts/rpg/rpg.js');
const ud = require('./scripts/ud/ud.js');
const dice = require('./scripts/dice/dice.js');
const avatar = require('./scripts/avatar/avatar.js');
const pingpong = require('./scripts/pingpong/pingpong.js');
const prune = require('./scripts/prune/prune.js');

const bot = new Discord.Client();
const trig = "!";

// API Options
// var open_weather_options = api_keys.open_weather_options;

// Useful functions
let command_dict = {
  "tarot": {
    "log": "Predicting the future",
    "func": tarot.tarot
  },
  "rpg": {
    "log": "Generating RPG character.",
    "func": rpg.rpg
  },
  "avatar": {
    "log": "Fetching avatar.",
    "func": avatar.getAvatar
  },
  "roll": {
    "log": "Rolling dice.",
    "func": dice.multiDice
  },
  "r": {
    "log": "Rolling dice.",
    "func": dice.multiDice
  },
  "ud": {
    "log": "Fetching urban wisdom.",
    "func": ud.ud
  },
  "ping": {
    "log": "Pinged, so I pong!.",
    "func": pingpong.ping
  },
  "pong": {
    "log": "Ponged, so I ping!",
    "func": pingpong.pong
  },
  "trick": {
    "log": "Tricking evil mashi.",
    "func": pingpong.trick
  },
  "prune": {
    "log": "Prunin'.",
    "func": prune.prune
  },
}


// Live bot behavior
bot.login(auth.token);

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on("message", async msg => {

  if (msg.content.startsWith(trig)) {
    let content = msg.content.substring(msg.content.indexOf(trig)+1);
    let command = content.split(' ')[0];
    if (command in command_dict) {
      console.log(command_dict[command].log);
      command_dict[command].func(msg, content);
    } else {
      msg.channel.send("oops")
    }

    // Get Help
    if (content === "help") {
      let message = "Every command starts with ! followed by some text. "
      + "All arguments are required besides those in [square brackets]. \n\n"
      + "**!avatar [@mention]** - *Gets the avatar of the mentioned user. If "
      + "you don't mention a user, it fetches your own avatar.*\n"
      + "**!help** - *Shows you this. Shows you information about "
      + "the command if you supply that argument.*\n"
      + "**!prune <n>** - *Prunes the last n messages. Don't go crazy.*\n"
      + "**!nick @mention <new_nickname>** - *Changes the nickname of the "
      + "mentioned person to new_nickname.*\n"
      + "**!ping** - *Makes the bot say \"Pong!\".*\n"
      + "**!pong** - *Makes the bot say \"Ping!\".*\n"
      + "**!rpg** - *Generates an rpg character.*\n"
      + "**!tarot [int int int]** - *Draws tarot cards. You can select which "
      + "cards in the deck to draw, or have it be random.*\n"
      + "**!roll [integer]d<integer>** - *!roll 2d6 rolls 2 6-sided dice. "
      + "*(Alias: !r)*\n"
      + "**!ud <search term> [, integer]** - *Finds the definition of search "
      + "term on UrbanDictionary. Example: \"!ud tennis ball, 3\" would return "
      + "the fourth definition for tennis ball (zero-indexed).*";
      msg.channel.send(message);
    }


    // Weather
    let weather_trigger = "w ";
    if (content.startsWith(weather_trigger)) {
      console.log("Fetching weather.");

      var components = content.split(' ');
      components.shift();
      open_weather_options.qs.q = components.join(' ');

      request(open_weather_options, function (error, response, body) {
      	if (error) throw new Error(error);
      	console.log(body);
        msg.channel.send(body);
        console.log(JSON.parse(body));
      });
    }



    // Rename
    let rename_trigger = "nick"
    if (content.startsWith(rename_trigger)) {
      console.log("Renaming folks.");
      if (
        msg.mentions.users.size === 1
        && content.split(' ').length > 2
      ) {
        let user_id = msg.mentions.users.first().id;
        let split_content = content.split(" ");
        if (split_content[1] === "<@!" + user_id + ">") {
          let new_nick = split_content.slice(2).join(" ");
          msg.guild.members.fetch(user_id).then(
            result => {
              let old_nick = result.user.username;
              result.setNickname(new_nick)
              .then(success =>
                {
                  msg.channel.send(old_nick + " is now named <@" + user_id + ">!");
                },
                failure => {
                  msg.channel.send("You are too powerful to rename. :(");
                }
              )
            }
          )
        } else {
          msg.channel.send("Invalid input. :(");
        }
      }
    }


  }
});

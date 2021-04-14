"use strict";

// Imports
// var rpg_vars = require('./rpg_vars.js');

// Define Constants
const Discord = require("discord.js");
const request = require("request");
const fs = require('fs');
const Canvas = require('canvas');
const auth = require("./auth.json");
const f = require('./funcs.js');
const tarot = require('./tarot/tarot.js');
const rpg = require('./rpg/rpg.js');
const ud = require('./ud/ud.js');
const bot = new Discord.Client();
const trig = "!";


// JSON Imports

const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));


// API Options
var ud_options = api_keys.ud_options;
var open_weather_options = api_keys.open_weather_options;

// Useful functions



// Live bot behavior
bot.login(auth.token);

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on("message", async msg => {

  if (msg.content.startsWith("!")) {
    let content = msg.content.substring(msg.content.indexOf(trig)+1);

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
      + "the third definition for tennis ball.*";
      msg.channel.send(message);
    }

    // Avatar Fetch
    if (content.startsWith("avatar")) {
      console.log("Fetching avatar.")
      //let embed = new Discord.RichEmbed();
      let embed = new Discord.MessageEmbed()
        .setDescription('Looking sharp! :3');
      console.log(msg.author.avatarURL());
      if (content === "avatar") {
        embed.setImage(msg.author.avatarURL() + '?size=256');
        msg.reply(embed);
      } else if (msg.mentions.users.size > 0) {
        embed.setImage(msg.mentions.users.first().avatarURL() + '?size=256')
        msg.reply(embed);
      } else {
        msg.reply("Invalid!")
      }
    }

    // Ping Response
    if (content === "ping") {
      console.log("Fetching ping.")
      msg.reply('Pong!');
    }

    // Pong Response
    if (content === "pong") {
      console.log("Fetching pong.")
      msg.reply('Ping!');
    }

    // trick Response
    if (content === "trick evil mashi") {
      console.log("Tempting evil mashi with food...")
      msg.reply('wtf');
    }

    // Dice Rolls
    if (content.startsWith('roll ') || content.startsWith('r ')) {
      console.log("Trying to roll stuff.");
      //check if only one word after the command
      if (content.split(' ').length === 2) {
        //check if command has a d folowed by a number
        let cmd_str = content.split(' ')[1];
        if (
          cmd_str.includes('d') &&
          f.isNumeric(cmd_str.split('d')[1])
        ) {
          //check to see if multiple dice
          if (f.isNumeric(cmd_str.split('d')[0])) {
            let send_str = "";
            let num_dice = Math.abs(parseInt(cmd_str.split('d')[0]));
            let dice_val = parseInt(cmd_str.split('d')[1]);
            //check to see if num of dice is insane
            if (num_dice > 100) {
              msg.channel.send("Are you crazy? That's so many dice! (Max: 100)");
            } else if (Math.abs(dice_val) * num_dice > 10000000) {
              msg.channel.send("That's gonna make the message too long, come on!");
            } else {
              let i;
              let sum = 0;
              for (i = 0; i < num_dice; i++) {
                let roll = rollDie(dice_val);
                send_str += "`" + roll.toString() + "`,";
                sum += roll;
              }
              msg.channel.send(
                send_str.slice(0, -1) + ".\nSum is `" + sum.toString() + "`"
              );
            }
          } else { //single dice
            msg.channel.send(
              "`" + rollDie(parseInt(cmd_str.split('d')[1])).toString() + "`"
            );
          }
        } else { // Didn't include d or number after d.
          msg.channel.send("Invalid.")
        }
      } else { // Command was wrong length.
        msg.channel.send("Invalid.")
      }
    }

    // Delete Messages
    if (content.startsWith("prune")) {
      console.log("Prunin'.");
      if (
        content.split(' ').length === 2
        && f.isNumeric(content.split(" ")[1])
      ) {
          let prune_num = parseInt(content.split(" ")[1], 10);
          if (prune_num > 20)
            {
              msg.channel.send("Are you crazy? That's too many!")
            } else {
            msg.channel.messages.fetch({ limit: prune_num + 1 })
              .then(messages => {
                msg.channel.bulkDelete(messages);
                msg.channel.send("Deleted " + prune_num.toString() + " messages." );
              })
              .catch(console.error);
            }
        } else {
        msg.channel.send("Try again but better.")
      }
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





    // Urban Dictionary
    let ud_trigger = "ud";
    if (content.startsWith(ud_trigger)) {
      console.log("Fetching urban wisdom.");
      let [is_valid, search_term, def_num] = ud.interpretUrbanString(content);
      ud.urbanDictionary(msg, is_valid, search_term, def_num)
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

    // RPG Character
    if (content === "rpg") {
      console.log("Generating rp character.");
      let send_msg = rpg.generateCharacter();
      msg.reply(send_msg);
    }

    // Tarot Reading
    if (content.startsWith("tarot")) {
      console.log("Predicting the future.");
      let xyz = tarot.interpretTarotString(content);
      let embed = await tarot.tarotReading(msg, xyz[0], xyz[1], xyz[2]);
      msg.channel.send({embed});
    }





  }
});

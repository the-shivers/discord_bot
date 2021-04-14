"use strict";

// Imports
// var rpg_vars = require('./rpg_vars.js');

// Define Constants
const Discord = require("discord.js");
const bot = new Discord.Client();
const trig = "!";
const auth = require("./auth.json");
const request = require("request");
const Canvas = require('canvas');
const f = require('./funcs.js');
const tarot = require('./tarot/tarot.js');
const fs = require('fs');

// JSON Imports
const tarot_info = JSON.parse(fs.readFileSync('./tarot/tarot.json', 'utf8'));
const rpg_vars = JSON.parse(fs.readFileSync('./rpg_vars.json', 'utf8'));
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));


// API Options
var ud_options = api_keys.ud_options;
var open_weather_options = api_keys.open_weather_options;

// var open_weather_options = {
//   method: 'GET',
//   url: 'https://community-open-weather-map.p.rapidapi.com/weather',
//   qs: {term: 'wat'},
//   headers: {
//     'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
//     'x-rapidapi-key': 'cabb5c6aaamsh53224d47dc5a03fp1dc952jsn88293d9f9dcc'
//   }
// };


// Useful functions


function rollDie(sides) {
  return Math.ceil(Math.random()*sides);
}



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

      let isValid = true
      let search_term = "default"
      let def_num = 0;

      if (content.split(' ').length === 2) {
        search_term = content.split(' ')[1].replace('"',"");
      } else if (
        content.split(' ').length > 2
        && !content.includes(",")
      ) {
        search_term = content.substring(ud_trigger.length + 1);
      } else if (
        content.split(' ').length > 2
        && content.includes(",")
        && !isNaN(content.split(", ")[1])
      ) {
        search_term = content.substring(ud_trigger.length + 1).split(", ")[0];
        def_num = +content.split(", ")[1];
      } else {
        isValid = false;
        msg.reply("Invalid input. :(");
      }

      if (isValid) {
        ud_options.qs.term = search_term;
        request(ud_options, function (error, response, body) {
          if (error) throw new Error(error);
          let result_list = JSON.parse(body).list;
          def_num = Math.min(def_num, result_list.length - 1);
          if (result_list.length > 0) {

            let word = result_list[def_num].word;
            word = "__**" + word + "**__\n";

            let definition = result_list[def_num].definition;
            definition = ">>> " + definition.replace(/\[|\]/g, '');
            if (definition.length > 1400) {
              definition = definition.substring(0, 1500);
            }
            definition = definition + "\n\n";

            let example = result_list[def_num].example;
            example = example.replace(/\[|\]|\*/g, '');
            if (example.length > 400) {
              example = example.substring(0, 1800 - definition.length);
            }
            example = "*" + example.trim() + "*";

            msg.channel.send(word + definition + example)
          } else {
            msg.channel.send("No results.")
          }
        });
      }
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
      let send_msg = "";
      let race = rpg_vars.races[Math.floor(Math.random() * rpg_vars.races.length)];
      let my_class = rpg_vars.classes[Math.floor(Math.random() * rpg_vars.classes.length)];
      let first_name = rpg_vars.first_names[Math.floor(Math.random() * rpg_vars.first_names.length)];
      let ln_1 = rpg_vars.ln_first[Math.floor(Math.random() * rpg_vars.ln_first.length)];
      let ln_2 = rpg_vars.ln_second[Math.floor(Math.random() * rpg_vars.ln_second.length)];
      let wp_1 = rpg_vars.weapon_first[Math.floor(Math.random() * rpg_vars.weapon_first.length)];
      let wp_2 = rpg_vars.weapon_second[Math.floor(Math.random() * rpg_vars.weapon_second.length)];
      let armor = rpg_vars.armor[Math.floor(Math.random() * rpg_vars.armor.length)];
      let gender = rpg_vars.genders[Math.floor(Math.random() * rpg_vars.genders.length)];
      let modifier = rpg_vars.modifiers[Math.floor(Math.random() * rpg_vars.modifiers.length)];
      let height = rpg_vars.height_ft[Math.floor(Math.random() * rpg_vars.height_ft.length)];
      let inches = rpg_vars.height_in[Math.floor(Math.random() * rpg_vars.height_in.length)];
      let alignment = rpg_vars.alignment[Math.floor(Math.random() * rpg_vars.alignment.length)];
      let lang1 = rpg_vars.basic_languages[Math.floor(Math.random() * rpg_vars.basic_languages.length)];
      let lang2 = rpg_vars.exotic_languages[Math.floor(Math.random() * rpg_vars.exotic_languages.length)];
      let lang3 = rpg_vars.ultra_exotic_languages[Math.floor(Math.random() * rpg_vars.ultra_exotic_languages.length)];
      let bg_key = rpg_vars.bg_keys[Math.floor(Math.random() * rpg_vars.bg_keys.length)];
      let bg = rpg_vars.backgrounds[bg_key];
      let bg_name = bg.name;
      let bg_type = bg.types[Math.floor(Math.random() * bg.types.length)];
      let pers = bg.personalities[Math.floor(Math.random() * bg.personalities.length)];
      let ideal = bg.ideals[Math.floor(Math.random() * bg.ideals.length)];
      let bond = bg.bonds[Math.floor(Math.random() * bg.bonds.length)];
      let flaw = bg.flaws[Math.floor(Math.random() * bg.flaws.length)];

      let str = rollDie(20);
      let dex = rollDie(20);
      let con = rollDie(20);
      let int = rollDie(20);
      let wis = rollDie(20);
      let cha = rollDie(20);
      let total = str+dex+con+int+wis+cha
      let stat = ''

      if (total > 90) {stat = 'Beastly!!!';}
      else if (total > 85) {stat = 'Extremely strong!!';}
      else if (total > 80) {stat = 'Very strong!';}
      else if (total > 75) {stat = 'Strong!';}
      else if (total > 70) {stat = 'Fairly strong.';}
      else if (total > 65) {stat = 'Somewhat strong.';}
      else if (total > 60) {stat = 'Average.';}
      else if (total > 55) {stat = 'Weak.';}
      else if (total > 50) {stat = 'Very weak.';}
      else if (total > 45) {stat = 'Frail.';}
      else if (total > 40) {stat = 'Extremely fragile.';}
      else {stat = 'Shamefully, pathetically weak.';}

      send_msg += "You are a " + modifier + ' ' + gender + ' ' + race + " "
      + my_class + " named " + first_name + " " + ln_1 + ln_2 + ". Standing at "
      + height + "'" + inches + ' and clad in ' + armor + ', you wield ' +  wp_1
      + ' and ' + wp_2 + '. You are ' + alignment + ' and speak ' + lang1 + ', '
      + lang2 + ', and ' + lang3 +'.\n\n'
      send_msg += '`STR: ' + str.toString() + "`\n"
      send_msg += '`DEX: ' + dex.toString() + "`\n"
      send_msg += '`CON: ' + con.toString() + "`\n"
      send_msg += '`INT: ' + int.toString() + "`\n"
      send_msg += '`WIS: ' + wis.toString() + "`\n"
      send_msg += '`CHA: ' + cha.toString() + "`\n"
      send_msg += 'Overall stats: **' + stat + '** (' + total.toString() + ')\n\n'
      send_msg += "Background: " + bg_name + " (Specialization: " + bg_type
      + "). " + pers + " " + ideal + " " + bond + " " + flaw
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

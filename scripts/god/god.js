"use strict";

// Imports
const fs = require('fs');
const Discord = require('discord.js');
const record_filename = './god.json';
const record_filename_full = './scripts/god/god.json';
const c = require('../fruitymon/f_config.js');
var g_json = require(record_filename);
var gm_json = require("./god_messages.json");

let expression_dict = {
  "angry": {
    "full": "./scripts/god/assets/god_angry.jpg",
    "name": "god_angry.jpg"
  },
  "enjoyment": {
    "full": "./scripts/god/assets/god_enjoyment.jpg",
    "name": "god_enjoyment.jpg"
  },
  "relaxed": {
    "full": "./scripts/god/assets/god_relaxed.jpg",
    "name": "god_relaxed.jpg"
  },
  "sad": {
    "full": "./scripts/god/assets/god_sad.jpg",
    "name": "god_sad.jpg"
  },
  "smile": {
    "full": "./scripts/god/assets/god_smile.jpg",
    "name": "god_smile.jpg"
  },
  "suspicious": {
    "full": "./scripts/god/assets/god_suspicious.jpg",
    "name": "god_suspicious.jpg"
  },
  "that_look": {
    "full": "./scripts/god/assets/god_that_look.jpg",
    "name": "god_that_look.jpg"
  },
  "thinking": {
    "full": "./scripts/god/assets/god_thinking.jpg",
    "name": "god_thinking.jpg"
  },
  "tongue": {
    "full": "./scripts/god/assets/tongue.jpg",
    "name": "tongue.jpg"
  },
  "wink": {
    "full": "./scripts/god/assets/god_wink.jpg",
    "name": "god_wink.jpg"
  },
  "humoring": {
    "full": "./scripts/god/assets/god_humoring.jpg",
    "name": "god_humoring.jpg"
  },
  "talking": {
    "full": "./scripts/god/assets/god_talking.jpg",
    "name": "god_talking.jpg"
  }
}

let default_expressions = [
  "smile",
  "smile",
  "smile",
  "smile",
  "relaxed",
  "relaxed",
  "relaxed",
  "thinking",
  "that_look",
  "sad",
  "angry",
  "angry"
]

let good_words = [
  "otter", "deer", "juggy", "akella", "groof", "nasen", "quil", "volc", "bird_d",
  "sin", "holy", "pray", "🙏", "good", ""
]

function randArr(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function determineDefaultExpression(freshness) {
  if (freshness === 0) {
    return 'angry';
  } else {
    var d = new Date();
    return default_expressions[d.getMinutes() % 12];
  }
}

function setAttachmentExpression(template, expr) {
  const attachment = new Discord.MessageAttachment(
    expression_dict[expr].full, expression_dict[expr].name
  );
  template
    .attachFiles(attachment)
    .setImage('attachment://' + expression_dict[expr].name);
}

function initialGod(template) {
  template
    .addField("Pray:", '`!god pray <your prayer here>`', true)
    .addField("Offer Fruitbux:", "`!god offer <quantity>`", true)
    .addField("Offer Fruit:", "`!god offer <emoji> <quantity>`", true);
}

function determineFreshness(msg) {
  // 0 is within the minute, 1 is within hour, 2 is within day, 3 is never
  if (msg.author.id in g_json) {
    let last_message_seconds = Math.round(
      (msg.createdTimestamp - g_json[msg.author.id]["Last Timestamp"]) / 1000
    );
    g_json[msg.author.id]["Last Timestamp"] = msg.createdTimestamp;
    if (last_message_seconds <= 60) {
      return 0;
    } else if (last_message_seconds <= 3600) {
      return 1;
    } else {
      return 2;
    }
  } else {
    g_json[msg.author.id] = {};
    g_json[msg.author.id]["Last Timestamp"] = msg.createdTimestamp;
    return 3;
  }
}

function setDefaultGreeting(msg, template, expr, freshness) {
  let footer = "What's up man? Got any offerings?";
  if (freshness === 0) {
    footer = randArr(gm_json["annoyed"]);
  } else if (["smile", "relaxed"].includes(expr)) {
    footer = randArr(gm_json["happy"][freshness - 1]);
  } else if (["thinking", "that_look"].includes(expr)) {
    footer = randArr(gm_json["thinking"][freshness - 1]);
  } else if (["sad"].includes(expr)) {
    footer = randArr(gm_json["sad"][freshness - 1]);
  } else if (["angry"].includes(expr)) {
    footer = randArr(gm_json["angry"][freshness - 1]);
  }
  footer = footer.split("$name").join(msg.author.username);
  template.setFooter(footer);
}

function analyzePrayer(prayer) {
  prayer = prayer.toLowerCase();
  let length = prayer.length;
  let commas = prayer.split(',').length - 1;
  let periods = prayer.split('.').length - 1;
  let questions = prayer.split('?').length - 1;
  let excl = prayer.split('!').length - 1;
  let punctuation = commas + periods + questions + excl
  let words = prayer.split(' ').length;
  let score = 0
  if (length > 300) {score = 0}
  if (length > 250 && length <= 300) {score = 20}
  if (length > 200 && length <= 250) {score = 40}
  if (length > 150 && length <= 200) {score = 60}
  if (length > 100 && length <= 150) {score = 70}
  if (length > 50 && length <= 100) {score = 50}
  if (length > 30 && length <= 50) {score = 40}
  if (length > 20 && length <= 30) {score = 35}
  if (length > 10 && length <= 20) {score = 20}
  if (length <= 10) {score = 0}
  if (words === 1) {score -= 10}
  if (words > 1 && words <= 5) {score += 5}
  if (words > 5 && words <= 10) {score += 10}
  if (words > 10 && words <= 20) {score += 20}
  if (words > 20 && words <= 25) {score += 30}
  if (words > 25 && words <= 35) {score += 20}
  if (words > 35 && words <= 50) {score += 10}
  if (words > 50) {score -= 10}
  if (questions > 0) {score += 10}
  if (punctuation === 0) {score -= 30}
  if (punctuation >= 2 && punctuation <= 4) {score += 10}
  if (prayer.includes('bitch')) {score -= 20}
  if (prayer.includes('fuck')) {score -= 20}
  if (prayer.includes('cunt')) {score -= 20}
  if (prayer.includes('shit')) {score -= 20}
  if (prayer.includes('furry')) {score -= 20}
  if (prayer.includes('uwu')) {score -= 40}
  if (prayer.includes('gay')) {score -= 20}
  if (prayer.includes('fag')) {score -= 20}
  if (prayer.includes(':3')) {score -= 40}
  if (prayer.includes('sneed')) {score += 40}
  if (prayer.includes('based')) {score += 20}
  if (prayer.includes('offering')) {score += 20}
  if (prayer.includes('bible')) {score += 20}
  if (prayer.includes('jesus')) {score += 20}
  if (prayer.includes('faith')) {score += 20}
  if (prayer.includes('faith')) {score += 20}
  if (prayer.includes('faith')) {score += 20}
  if (prayer.includes('faith')) {score += 20}
  if (prayer.includes('faith')) {score += 20}
  if (prayer.includes('faith')) {score += 20}
  if (prayer.includes('faith')) {score += 20}
  if (prayer.includes('god')) {score += 20}
  console.log("Length:", length, "Words:", words, "Score:", score);
  return score;
}



function god(msg, content){
  const template = new Discord.MessageEmbed()
    .setColor("#FFFF00");
  if (content.split(' ').length === 1) {
    // Default mode
    let freshness = determineFreshness(msg);
    let def_expr = determineDefaultExpression(freshness);
    setDefaultGreeting(msg, template, def_expr, freshness);
    setAttachmentExpression(template, def_expr);
    initialGod(template);
    template.setTitle(`God has spoken to you, ${msg.author.username}!`);
  } else {
    let result = 10;
    if (content.split(' ')[1] === "pray") {
      // Prayer mode. Generate dice roll and cutoff.
      let prayer = content.split(' ').slice(1).join(' ');
      result = analyzePrayer(prayer);
    } else if (content.split(' ')[1] === "offer") {
      // Offering mode.
      if (content.split(' ')[2] in c.emoji_to_string) {
        // Emoji offering
      } else if (f.isNumeric(content.split(' ')[2])) {
        // Monetary offering
      }
    }
    // Placeholder response below.
    let roll = Math.floor(Math.random() * Math.max(result, 40))
    if (roll > 30) {
      setAttachmentExpression(template, "smile");
      template.setTitle(`God is pleased with your offering, ${msg.author.username}!`);
      template.setFooter("That was a lovely offering. I won't smite you today!");
    } else if (roll > 20) {
      setAttachmentExpression(template, "thinking");
      template.setTitle(`God is confused!!`);
      template.setFooter(`Do you mind running that one by me again? I'm omniscient and even I couldn't make head nor tail of it! Haha!`);
    } else {
      setAttachmentExpression(template, "angry");
      template.setTitle(`God is enraged!!`);
      template.setFooter(`You call that an offering ${msg.author.username}, you little bitch? Do better. You're lucky smiting hasn't been coded yet.`);
    }
    // Placeholder response above.
  }
  msg.channel.send(template);
  fs.writeFile(
    record_filename_full,
    JSON.stringify(g_json, null, 2),
    function writeJSON(err) {
      if (err) return console.log(err);
    }
  );
}

module.exports = { god };

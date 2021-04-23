"use strict";

// Imports
const fs = require('fs');
const Discord = require('discord.js');
const g_record_filename = './god.json';
const g_record_filename_full = './scripts/god/god.json';
const c = require('../fruitymon/f_config.js');
var g_json = require(g_record_filename);
var gm_json = require("./god_messages.json");
const record_filename = '../fruitymon/f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const f = require('../../funcs.js');
const difficulty = 40; //can be 20, 30 or 40 for easiest to hardest

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
    "full": "./scripts/god/assets/god_tongue.jpg",
    "name": "god_tongue.jpg"
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
  },
  "fire": {
    "full": "./scripts/god/assets/god_fire.jpg",
    "name": "god_fire.jpg"
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

function analyzeOffering(n) {
  let score = 0;
  if (n >= 10) {score += 5}
  if (n >= 100) {score += 5}
  if (n >= 500) {score += 5}
  if (n >= 1000) {score += 5}
  if (n >= 2000) {score += 10}
  if (n >= 3500) {score += 10}
  if (n >= 5000) {score += 10}
  if (n >= 10000) {score += 10}
  if (n >= 20000) {score += 15}
  if (n >= 30000) {score += 15}
  if (n >= 30000) {score += 15}
  if (n >= 40000) {score += 15}
  if (n >= 50000) {score += 15}
  if (n >= 60000) {score += 15}
  if (n >= 70000) {score += 15}
  if (n >= 80000) {score += 15}
  if (n >= 90000) {score += 15}
  if (n >= 100000) {score += 15}
  return score;
}

function analyzeDiff(n) {
  let result = -2 // major boon
  if (n > -20) {result = -1}
  if (n > -5) {result = 0}
  if (n > 5) {result = 1}
  if (n > 15) {result = 2}
  if (n > 45) {result = 3} // minor boon
  return result;
}

function bigCurse(msg, template, had_offering) {
  setAttachmentExpression(template, "fire");
  template.setTitle(`God has cursed you, ${msg.author.username}!`)
    .setColor("#FF0000");
  let footer_msg = '';
  if (had_offering) {
    footer_msg = `"You call this an offering? I curse thee!"\n\nGod has made your rolls worse!`
    if (f_record[msg.author.id]["Perks"].includes("lucky")) {
      footer_msg += " You now roll 3 fewer dice per pick! Forever!"
      f_record[msg.author.id]["Number of Dice"] -= 3;
    } else if (f_record[msg.author.id]["Perks"].includes("greedy")) {
      footer_msg += " You get 2 fewer picks and 2 fewer dice rolls per pick! Forever!";
      f_record[msg.author.id]["Number of Dice"] -= 2;
      f_record[msg.author.id]["Pick Limit"] -= 2;
    }
  } else {
    footer_msg = "pretty shit prayer bro..."
  }
  template.setFooter(footer_msg);
}

function smallCurse(msg, template, had_offering) {
  setAttachmentExpression(template, "sad");
  template.setTitle(`God has cursed you, ${msg.author.username}!`)
    .setColor("#FF8800");
  let footer_msg = '';
  if (had_offering) {
    footer_msg = `"You call this an offering? It makes me sad. I curse thee! But not severely."\n\nGod stabbed you and took your fruitbux!`
    footer_msg += " You lost 2000 Fruitbux.";
    f_record[msg.author.id]["Fruitbux"] -= 2000;
    f_record[msg.author.id]["Fruitbux"] = Math.max(0, f_record[msg.author.id]["Fruitbux"]);
  } else {
    footer_msg = "pretty shit prayer bro..."
  }
  template.setFooter(footer_msg);
}

function uncertain(msg, template, had_offering) {
  setAttachmentExpression(template, "that_look");
  template.setTitle(`God has no strong feelings about your offering, ${msg.author.username}!`)
    .setColor("#FFFF00");
  let footer_msg = '';
  if (had_offering) {
    footer_msg = "Pretty strange offering, y'know? Not good, but not really bad. I'd love to curse you but it just wouldn't feel right. But do better next time."
  } else {
    footer_msg = "pretty shit prayer bro..."
  }
  template.setFooter(footer_msg);
}

function smallBoon(msg, template, had_offering) {
  setAttachmentExpression(template, "humoring");
  template.setTitle(`God has blessed you, ${msg.author.username}!`)
    .setColor("#AAFF00");
  let footer_msg = '';
  if (had_offering) {
    footer_msg = "I mean, it's not the best offering I've ever seen, but it's way better than most! You know what? Here's a small reward. Keep up the good work.\n\nGod has given you some money!!"
    footer_msg += " You got an extra 2000 Fruitbux!"
    f_record[msg.author.id]["Fruitbux"] += 2000;
  } else {
    footer_msg = "pretty shit prayer bro..."
  }
  template.setFooter(footer_msg);
}

function bigBoon(msg, template, had_offering) {
  setAttachmentExpression(template, "tongue");
  template.setTitle(`God has blessed you, ${msg.author.username}!`)
    .setColor("#66FF00");
  let footer_msg = '';
  if (had_offering) {
    footer_msg = `"Wow ${msg.author.username}, what a cool offering! I really liked that. I was worried I was going to have to transform into a swan and have sex with your mother, but I think I'll give you a nice blessing instead!"\n\nGod has permanently improved your rolls!`
    if (f_record[msg.author.id]["Perks"].includes("lucky")) {
      footer_msg += " You now roll 1 extra die per pick! Forever!"
      f_record[msg.author.id]["Number of Dice"] += 1;
    } else if (f_record[msg.author.id]["Perks"].includes("greedy")) {
      footer_msg += " You get 1 extra picks and 1 extra dice rolls per pick! Forever!";
      f_record[msg.author.id]["Number of Dice"] += 1;
      f_record[msg.author.id]["Pick Limit"] += 1;
    }
  } else {
    footer_msg = "pretty shit prayer bro..."
  }
  template.setFooter(footer_msg);
}

function permanentBoon(msg, template, had_offering) {
  setAttachmentExpression(template, "wink");
  template.setTitle(`God has blessed you, ${msg.author.username}!`)
    .setColor("#22FF00");
  let footer_msg = '';
  if (had_offering) {
    footer_msg = "This is the greatest offer anyone has ever made. You are a saint. A saint! I can't stop thinking about it. Have a blessing. A big one! You deserve it! You're great!\n\nGod has permanently improved your rolls!"
    if (f_record[msg.author.id]["Perks"].includes("lucky")) {
      footer_msg += " You now roll 10 extra dice per pick! Forever!"
      f_record[msg.author.id]["Number of Dice"] += 10;
    } else if (f_record[msg.author.id]["Perks"].includes("greedy")) {
      footer_msg += " You get 5 extra picks and 5 extra dice rolls per pick! Forever!";
      f_record[msg.author.id]["Number of Dice"] += 5;
      f_record[msg.author.id]["Pick Limit"] += 5;
    }
  } else {
    footer_msg = "pretty shit prayer bro..."
  }
  template.setFooter(footer_msg);
}

let boon_dict = {
  "-2": bigCurse,
  "-1": smallCurse,
  "0": uncertain,
  "1": smallBoon,
  "2": bigBoon,
  "3": permanentBoon
}


function god(msg, content) {
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
  } else if (content.split(' ')[1] === "pray") {
    // Prayer mode. Generate dice roll and cutoff.
    let prayer = content.split(' ').slice(1).join(' ');
    var result = analyzePrayer(prayer);
    let god_roll = f.rollDie(result + difficulty);
    let boon = analyzeDiff(result - god_roll);
    boon_dict[boon](msg, template, false);
  } else if (content.split(' ')[1] === "offer") {
    // Offering mode.
    if (f.isNumeric(content.split(' ')[2])) {
      // Monetary offering
      let amt = content.split(' ')[2]
      if (
        msg.author.id in f_record &&
        f_record[msg.author.id]["Fruitbux"] >= amt
      ) {
        f_record[msg.author.id]["Fruitbux"] -= amt;
        let result = analyzeOffering(amt);
        let god_roll = f.rollDie(result + difficulty);
        let boon = analyzeDiff(result - god_roll);
        console.log(`Your result ${result} and gods score ${god_roll} \nfor a diff of ${result-god_roll} and boon of ${boon}`)
        boon_dict[boon](msg, template, true);
        fs.writeFileSync(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
          if (err) return console.log(err)});
      } else {
        msg.channel.send('Don\'t make offerings you can\'t afford!');
      }
    }
  } else {
  // Placeholder response below.
  let result = 5
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
    g_record_filename_full,
    JSON.stringify(g_json, null, 2),
    function writeJSON(err) {
      if (err) return console.log(err);
    }
  );
}

module.exports = { god };

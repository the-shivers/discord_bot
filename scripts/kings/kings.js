"use strict";

// Imports
const Discord = require("discord.js");
const fs = require('fs');
const f = require('../../funcs.js');
const kings_filename_full = './scripts/kings/kings.json';
var kings_json = require('./kings.json');
const img_type = ".png"
const img_loc = 'scripts/kings/assets/'

// Constants
const nums = [
  "Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Jack", "Queen", "King"
];
const suits = ["Diamonds", "Clubs", "Hearts", "Spades"];
const card_arr = [];
for (let i = 0; i < suits.length; i++) {
  for (let j = 0; j < nums.length; j++) {
    card_arr.push(nums[j] + " of " + suits[i])
  }
}
const rules = {
  "Ace": "Everyone drinks (a lot)!",
  "Two": "You (pick someone to drink)!",
  "Three": "Me (the player who drew the card drinks)!",
  "Four": "Whores (subs drink)!",
  "Five": "\"Thumb Master\" (Whenever the person who drew this card makes a post, the last one to post in response has to drink. This continues until another person draws a five).",
  "Six": "Dicks (doms drink)!",
  "Seven": "Truth or alcohol poisoning!",
  "Eight": "Mate (pick somebody and whenever one of you drinks, both of you drink).",
  "Nine": "Bust a rhyme (the player who drew the card says a word. Then, the next player has to give a word that rhymes with the original. This continues until somebody takes too long to think of something or repeats something already said)!",
  "Ten": "Categories (the player who drew the card picks a category, then names a member of that category. Then the next player has to name something in that category. This continues until somebody takes too long to think of something or repeats something already said)!",
  "Jack": "Make a rule (the player who drew the card gets to make up a new rule for the game).",
  "Queen": "Question Master!",
  "King": "King (the player who drew the card is the king and must be referred to as king or face punishment)!"
}

function cardToImage(str) {
  // returns image string for card strings
  return str.split(" ").join("_").toLowerCase() + ".png"
}

function playerListStr() {
  let str = "```";
  for (var id in kings_json.players) {
    str += `${(kings_json.players[id].i + 1)}. ${kings_json.players[id].name}`
    if (kings_json.players[id].i === kings_json.current_player) {
      str += " <== NEXT TO DRAW\n"
    } else {
      str += "\n"
    }
  }
  return str + "```";
}

function startGame(msg) {
  // Update JSON
  kings_json = {};
  kings_json["status"] = true;
  kings_json["players"] = {};
  kings_json["players"][msg.author.id] = {
    "name": msg.author.username,
    "i": 0,
    "admin": true
  };
  kings_json["cards"] = f.shuffle(card_arr);
  kings_json["current_player"] = 0;
  let player_list = "1. " + msg.author.username + " (Current Player)";
  let cards_remaining = "`52`";
  const attachment = new Discord.MessageAttachment(
    './scripts/kings/assets/crown.gif', 'crown.gif'
  );
  const embed = new Discord.MessageEmbed()
    .setTitle(`A game of Kings has begun!`)
    .setColor("#BB44DD")
    .addField(
      "Instructions:",
      "Use \`!kings join\` to join.\nUse \`!draw\` to start playing.",
      false
    )
    .addField("Players:", player_list, true)
    .addField("Cards Remaining:", cards_remaining, true)
    .attachFiles(attachment)
    .setThumbnail('attachment://crown.gif')
  msg.channel.send(embed);
  fs.writeFile(
    kings_filename_full,
    JSON.stringify(kings_json, null, 2),
    function writeJSON(err) {
      if (err) return console.log(err);
    }
  );
}

async function drawCard(msg) {
  let card = kings_json.cards.pop();
  let img_str = cardToImage(card);
  kings_json.current_player = (kings_json.current_player + 1) % Object.keys(kings_json.players).length
  let player_list = playerListStr();
  const attachment = new Discord.MessageAttachment(img_loc + img_str, img_str);
  const embed = new Discord.MessageEmbed()
    .setTitle(`${msg.author.username} drew a card!`)
    .setColor("#BB44DD")
    .addField(card, rules[card.split(" ")[0]], true)
    .addField("Cards Remaining", `\`${kings_json.cards.length}\``, true)
    .addField("Players:", player_list, false)
    .attachFiles(attachment)
    .setImage('attachment://' + img_str)
  await msg.channel.send(embed);
  if (kings_json.cards.length === 0) {
    msg.channel.send("The kings game is over! Nice job!");
    kings_json.status = false;
  }
  fs.writeFile(
    kings_filename_full,
    JSON.stringify(kings_json, null, 2),
    function writeJSON(err) {
      if (err) return console.log(err);
    }
  );
}

function kings(msg, content) {
  let split = content.split(" ").filter(Boolean)
  console.log(split)
  if (split.length === 1 && kings_json.status === true) {
    msg.channel.send(
      "A game is already going. Try \`!kings join\` to join, or \`!draw\` to \
      pick a card if you've already joined. To end the game, use \`!kings end\`")
    return ;
  } else if (split.length === 1 && (!("status" in kings_json) || kings_json.status === false)) {
    startGame(msg);
    return ;
  }
  if (split.length === 2 && split[1] === "join") {
    // Check if game is active
    if (!kings_json.status) {
      msg.channel.send("There's no game to join! Use \`!kings\` to start a new game.")
      return ;
    }
    // Check that they're not already in the game
    for (var id in kings_json.players) {
      if (id === msg.author.id) {
        msg.channel.send("You're already playing!")
        return;
      }
    }
    // Let them join
    kings_json.players[msg.author.id] = {
      "name": msg.author.username,
      "i": Object.keys(kings_json.players).length,
      "admin": false
    }
    msg.channel.send(`${msg.author.username} has joined!`)
    fs.writeFile(
      kings_filename_full,
      JSON.stringify(kings_json, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );
    return ;
  } else if (split.length === 2 && split[1] === "end") {
    kings_json.status = false;
    msg.channel.send("The kings game is over! Nice job!");
    fs.writeFile(
      kings_filename_full,
      JSON.stringify(kings_json, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );
    return ;
  } else {
    msg.channel.send("Invalid entry. Use \`!kings\` to start a game.")
  }
}

function draw(msg, content) {
  // Check if game is active
  if (!("status" in kings_json) || kings_json.status === false) {
    msg.channel.send("There's no game active! Use \`!kings\` to start a game.")
    return ;
  }
  // Check if they're in the game and get the current player name while we do.
  let msg_author_in_game = false;
  let msg_author_player_num;
  let current_player_name;
  for (var id in kings_json["players"]) {
    if (id === msg.author.id) {
      msg_author_in_game = true
      msg_author_player_num = kings_json.players[id].i;
    };
    if (kings_json.players[id].i === kings_json.current_player) {
      current_player_name = kings_json.players[id].name;
    }
  }
  if (!msg_author_in_game) {
    msg.channel.send("You aren't in the game! Use \`!kings join\` to join.")
    return ;
  }
  // Check if its their turn
  if (msg_author_player_num !== kings_json.current_player) {
    msg.channel.send(`It's not your turn! Wait for ${current_player_name} to go.`)
    return;
  }
  // Draw a card and post the embed
  drawCard(msg);
}


module.exports = {kings, draw};

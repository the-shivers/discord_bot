"use strict";

// Define Constants
const Discord = require("discord.js");
const fs = require('fs');
const Canvas = require('canvas');
const f = require('../funcs.js');
const loc_str = './tarot/cards/';
const cards = JSON.parse(fs.readFileSync('./tarot/tarot.json', 'utf8')).tarot;
const ttl_cards = cards.length;
const card_height = 300;
const card_width = 175;
const roman_nums = ['I', 'II', 'III']
const arcana_arr = [
  {
    "color": "#66FF00",
    "alert": "🥱💤 **No major arcana. Pretty boring tarot...** 💤🥱"
  }, {
    "color": "#BBBB00",
    "alert": "🤔 **1 major arcana! Mild changes ahead.** 🤔"
  }, {
    "color": "#FF7700",
    "alert": "😮😮 **2 MAJOR ARCANA! BIG CHANGES IN FUTURE!** 😮😮"
  }, {
    "color": "#FF0000",
    "alert": "**🚨⚠️🚨⚠️🚨 3 MAJOR ARCANA!!! ENORMOUS CHANGES COMING!!! "
      + "🚨⚠️🚨⚠️🚨**"
  }
]


// Key Functions
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


function rotateCanvas(ctx, canvas) {
  ctx.translate(canvas.width, canvas.height);
  ctx.scale(-1, -1);
  return ctx;
}


function interpretTarotString(text) {
  // Converts discord message (string) to tarot paramters, if possible.
  // Returns three integers in array, either from string or generated randomly.
  var tarot_nums = [];
  if (
    text.split(' ').length === 4 &&
    f.isNumeric(text.split(" ")[1]) &&
    f.isNumeric(text.split(" ")[2]) &&
    f.isNumeric(text.split(" ")[3])
  ) {
    tarot_nums = [
      Math.abs(parseInt(text.split(" ")[1], 10) % ttl_cards),
      Math.abs(parseInt(text.split(" ")[2], 10) % ttl_cards),
      Math.abs(parseInt(text.split(" ")[3], 10) % ttl_cards)
    ];
  } else {
    while (tarot_nums.length < 3) {
      let tarot_num = Math.floor(Math.random() * ttl_cards);
      if (!tarot_nums.includes(tarot_num)) {
        tarot_nums.push(tarot_num);
      }
    }
  }
  return tarot_nums;
}

async function tarotReading(msg, x, y, z) {
  // Takes discord message and 3 integers to generate Tarot spread embed.
  // Sends a preparatory message prior to generation. Returns nothing.

  // Send preparatory message.
  msg.channel.send(
    "Shuffling, then drawing cards `" + x + "`, `" + y + "`, and `" + z + "`."
  );

  // Define which cards will be "reversed", at 1/3 probabiltiy. 1 if reversed.
  let shuffled = shuffle(cards);
  let rev_list = [
    Math.round(Math.abs(Math.random() - (1/6))),
    Math.round(Math.abs(Math.random() - (1/6))),
    Math.round(Math.abs(Math.random() - (1/6))),
  ];

  // Draw cards
  const c1 = shuffled[x];
  const c2 = shuffled[y];
  const c3 = shuffled[z];
  const hand_array = [c1, c2, c3];

  // Count major arcana, adjust styling based on results
  var major_arcana = 0
  for (var i = 0; i < hand_array.length; i++) {
    major_arcana += (hand_array[i].suite === 'major') ? 1 : 0;
  }
  major_arcana = major_arcana.toString();

  // Gather titles and descriptions of cards based on reversals
  var card_data = [];
  for (var i = 0; i < rev_list.length; i++) {
      if (rev_list[i] === 1) {
        var title = roman_nums[i] + ". (Reversed)";
        var desc = roman_nums[i] + ". Reversed Interpretation: "
        + hand_array[i].interpretation.split(' Reversed: ')[1] + "\n\n";
      } else {
        var title = roman_nums[i] + '.'
        var desc = roman_nums[i] + '. Interpretaton: '
        + hand_array[i].interpretation.split(' Reversed: ')[0] + '\n\n';
      }
      card_data.push({"title": title, "desc":desc});
  }

  // Create embed with canvas
  var canvas = Canvas.createCanvas(585, 340);
  var ctx = canvas.getContext('2d');
  const loc_str = './tarot/cards/';
  const left_img = await Canvas.loadImage(loc_str + c1.image);
  const center_img = await Canvas.loadImage(loc_str + c2.image);
  const right_img = await Canvas.loadImage(loc_str + c3.image);

  // Adjust x positioning based on reversals
  var c1_x = (rev_list[0] === 0) ? 20 : 390;
  var c2_x = 205;
  var c3_x = (rev_list[2] === 0) ? 390 : 20;

  //Draw and flip
  if (rev_list[0] === 1) {ctx = rotateCanvas(ctx, canvas);}
  ctx.drawImage(left_img, c1_x, 20, card_width, card_height);
  if (rev_list[0] !== rev_list[1]) {ctx = rotateCanvas(ctx, canvas);}
  ctx.drawImage(center_img, c2_x, 20, card_width, card_height);
  if (rev_list[1] !== rev_list[2]) {ctx = rotateCanvas(ctx, canvas);}
  ctx.drawImage(right_img, c3_x, 20, card_width, card_height);

  // Create embed and return
  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'tarot.jpg');
  const embed = new Discord.MessageEmbed()
    .addField('Summary', arcana_arr[major_arcana].alert)
    .setColor(arcana_arr[major_arcana].color)
    .addField(card_data[0].title, c1.name, true)
    .addField(card_data[1].title, c2.name, true)
    .addField(card_data[2].title, c3.name, true)
    .setTitle("What does your future hold?")
    .attachFiles(attachment)
    .setImage('attachment://tarot.jpg')
    .setFooter(card_data[0].desc + card_data[1].desc + card_data[2].desc);
  return embed;
}

module.exports = { interpretTarotString, tarotReading };

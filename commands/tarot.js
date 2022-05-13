"use strict";

// Define Constants
const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const f = require('../funcs.js');
const loc_str = './assets/tarot/';
const cards = require('.' + loc_str + 'tarot.json').tarot;
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
function rotateCanvas(ctx, canvas) {
  ctx.translate(canvas.width, canvas.height);
  ctx.scale(-1, -1);
  return ctx;
}

async function tarot(seed) {

  let now = new Date();
  let fullDaysSinceEpoch = Math.floor(now/8.64e7);
  seed = seed + fullDaysSinceEpoch;

  function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  let seed_rand1 = mulberry32(seed)();
  let seed_rand2 = mulberry32(seed + 1)();
  let seed_rand3 = mulberry32(seed + 2)();

  let rev_list = [
    (Math.round(seed_rand1 * 10000000) % 3) % 2,
    (Math.round(seed_rand2 * 10000000) % 3) % 2,
    (Math.round(seed_rand3 * 10000000) % 3) % 2
  ];

  // Draw cards
  const c1 = cards[Math.floor(seed_rand1 * ttl_cards)];
  const c2 = cards[Math.floor(seed_rand2 * ttl_cards)];
  const c3 = cards[Math.floor(seed_rand3 * ttl_cards)];
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
  var canvas = Canvas.createCanvas(565, 320);
  var ctx = canvas.getContext('2d');
  const left_img = await Canvas.loadImage(loc_str + c1.image);
  const center_img = await Canvas.loadImage(loc_str + c2.image);
  const right_img = await Canvas.loadImage(loc_str + c3.image);

  // Adjust x positioning based on reversals
  var c1_x = (rev_list[0] === 0) ? 10 : 380;
  var c2_x = 195;
  var c3_x = (rev_list[2] === 0) ? 380 : 10;

  //Draw and flip
  if (rev_list[0] === 1) {ctx = rotateCanvas(ctx, canvas);}
  ctx.drawImage(left_img, c1_x, 10, card_width, card_height);
  if (rev_list[0] !== rev_list[1]) {ctx = rotateCanvas(ctx, canvas);}
  ctx.drawImage(center_img, c2_x, 10, card_width, card_height);
  if (rev_list[1] !== rev_list[2]) {ctx = rotateCanvas(ctx, canvas);}
  ctx.drawImage(right_img, c3_x, 10, card_width, card_height);

  // Create embed and return
  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'tarot.jpg');
  const embed = new Discord.MessageEmbed();
    embed.addField('Summary', arcana_arr[major_arcana].alert);
    embed.setColor(arcana_arr[major_arcana].color);
    embed.addField(card_data[0].title, c1.name, true);
    embed.addField(card_data[1].title, c2.name, true);
    embed.addField(card_data[2].title, c3.name, true);
    embed.setTitle("What does your future hold?");
    // embed.attachFiles(attachment);
    // embed.setImage('attachment://tarot.jpg');
    embed.setFooter(card_data[0].desc + card_data[1].desc + card_data[2].desc);
  return([embed, attachment]);
}

module.exports = {
  type: "public",
  cat: "utility",
  desc: "Get a tarot reading",
	data: new SlashCommandBuilder()
		.setName('tarot')
		.setDescription('Tarot card reading.')
		.addIntegerOption(option => option
      .setName('seed')
      .setDescription('Use your lucky number to get a special daily tarot.')
    ),
	async execute(interaction) {
    let seed = Math.floor(Math.random()*100000);
    if (!(interaction.options.getInteger('seed') == null)) {
      seed = interaction.options.getInteger('seed') % 100000;
    }
    let result = await tarot(seed);
    interaction.reply({
      embeds: [result[0].setImage('attachment://tarot.jpg')],
      files: [result[1]]
    });
	},
};

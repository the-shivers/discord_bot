"use strict";

// Define Constants
const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const f = require('./../funcs.js');
const loc_str = './assets/grid/'; //const loc_str = './assets/tarot/';
//const cards = require('.' + loc_str + 'tarot.json').tarot;
const pairs = require('.' + loc_str + 'grid.json').pairs; // Array of arrays
const width = 700;
const height = 700;


function getRadius(n) { // If a server is larger, make the icons smaller.
  if (n > 50) return 30;
  if (n > 25) return 35;
  if (n > 20) return 40;
  return 45;
}

function awaitAll(list, asyncFn) {
  const promises = [];
  list.forEach(x => {
    promises.push(asyncFn(x[1].user.displayAvatarURL({ format: 'jpg' })));
  });
  return Promise.all(promises);
}

async function grid(interaction, pair1, pair2) {
  const canvas = Canvas.createCanvas(width, height);
	const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage(loc_str + 'grid.jpg');
	ctx.drawImage(background, 0, 0, width, height);
  let guild_membs = await interaction.guild.members.fetch();
  let gm_arr = f.shuffle([...guild_membs]);
  let rad = getRadius(gm_arr.length);

  // Asynchronously get images
  let load_arr = await awaitAll(gm_arr, Canvas.loadImage)

  // Loop through images and draw
  for (let i = 0; i < gm_arr.length; i++) {
    let x = Math.random() * (width - rad * 2);
    let y = Math.random() * (height - rad * 2);
    var new_canvas = Canvas.createCanvas(rad * 2, rad * 2);
    var new_ctx = new_canvas.getContext('2d');
    new_ctx.beginPath();
    new_ctx.arc(rad, rad, rad, 0, Math.PI * 2, true);
    new_ctx.clip();
    let avatar = load_arr[i]
  	new_ctx.drawImage(avatar, 0, 0, rad*2, rad*2);
    ctx.drawImage(new_canvas, x, y, rad*2, rad*2);
  }

  // Text
  ctx.textAlign = "center";
  ctx.font = '32px comic sans ms';
  ctx.fillText(pair1[0].trim(), width / 2, 30);
  ctx.fillText(pair1[1].trim(), width / 2, height - 15);
  ctx.rotate(Math.PI/2);
  ctx.fillText(pair2[0].trim(), width / 2, - 15);
  ctx.rotate(Math.PI);
  ctx.fillText(pair2[1].trim(), -width / 2, height - 15);

  return(new Discord.MessageAttachment(canvas.toBuffer(), 'grid.png'));

};


module.exports = {
  type: "private",
  cat: "utility",
  desc: "Display server members in a chart.",
	data: new SlashCommandBuilder()
		.setName('grid')
		.setDescription('Plot server members.')
    .addStringOption(option => option
      .setName('north')
      .setDescription('An adjective')
    ).addStringOption(option => option
      .setName('south')
      .setDescription('An adjective, usually the opposite of north.')
    ).addStringOption(option => option
      .setName('west')
      .setDescription('An adjective.')
    ).addStringOption(option => option
      .setName('east')
      .setDescription('An adjective, usually the opposite of west.')
    ),
	async execute(interaction) {
    let pair1;
    let pair2;
    if (
      interaction.options.getString('north') == null ||
      interaction.options.getString('south') == null
    ) {
      pair1 = pairs[Math.floor(Math.random() * pairs.length)];
    } else {
      pair1 = [
        interaction.options.getString('north'),
        interaction.options.getString('south')
      ];
    };
    if (
      interaction.options.getString('east') == null ||
      interaction.options.getString('west') == null
    ) {
      pair2 = pairs[Math.floor(Math.random() * pairs.length)];
    } else {
      pair2 = [
        interaction.options.getString('east'),
        interaction.options.getString('west')
      ];
    };
    let result = await grid(interaction, pair1, pair2);
    interaction.reply({files: [result]});
	},
};

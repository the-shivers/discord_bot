"use strict";

const Discord = require("discord.js");
const im = require('imagemagick');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');
const Canvas = require('canvas');


module.exports = {
  type: "private",
  cat: "utility",
  desc: "Rotate the image.",
	data: new SlashCommandBuilder()
		.setName('rotate')
		.setDescription('Rotate the image.')
    .addIntegerOption(option => option
      .setName('degrees')
      .setDescription('Degrees of rotation (-180 to 180, default = 90).')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let degrees = interaction.options.getInteger('degrees') ?? 90;
    degrees = Math.min(Math.max(degrees, -180), 180);
    let img_details = await get_img_details(await get_msgs(interaction));
    console.log(img_details);
    let img = await Canvas.loadImage(img_details.url);

    // Get new image dimensions
    let rads = degrees * Math.PI / 180;
    let x1 = Math.sin(rads) * img_details.height;
    let x2 = Math.cos(rads) * img_details.width;
    let y1 = Math.sin(rads) * img_details.width;
    let y2 = Math.cos(rads) * img_details.height;
    let ttl_x = x1 + x2;
    let ttl_y = y1 + y2;

    // Check size
    if (ttl_x * ttl_y > 2500 * 3000) {
      interaction.editReply({ content: "Too big to rotate. :(", ephemeral: false });
      return;
    }

    // Apply rotation
    const canvas = Canvas.createCanvas(ttl_x, ttl_y);
  	const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, ttl_x/2, ttl_y/2); // sets scale and origin
    ctx.rotate(rads);
    ctx.drawImage(img, -img_details.width/2, -img_details.height/2);
    let attach = new Discord.MessageAttachment(canvas.toBuffer(), 'rotate.png');
    interaction.editReply({ files: [attach], ephemeral: false });

  }
}

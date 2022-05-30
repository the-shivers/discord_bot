"use strict";

const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');
const Canvas = require('canvas');

module.exports = {
  type: "private",
  cat: "utility",
  desc: "Rotate the image.",
	data: new SlashCommandBuilder()
		.setName('stamp')
		.setDescription('Stamp the last image!')
    .addStringOption(option => option
      .setName('caption')
      .setDescription('The caption to be stamped.')
      .setRequired(true)
    ),
	async execute(interaction) {
    await interaction.deferReply();

    // Get image components
    let caption = interaction.options.getString('caption');
    if (caption.length > 10) {
      msg.channel.send("That's too long! It's just a stamp, not a novel!");
      return;
    }
    let img_details = await get_img_details(await get_msgs(interaction));
    if (img_details.url.length === 0) {
      interaction.editReply("Couldn't find an image :(")
      return;
    }

    // Draw BG
    const canvas = Canvas.createCanvas(img_details.width, img_details.height);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage(img_details.url);
    ctx.drawImage(background, 0, 0, img_details.width, img_details.height);

    // Generate text
    const text_can = Canvas.createCanvas(img_details.width*1.5, img_details.height*1.5)
    const text_ctx = text_can.getContext('2d');
    let line_width = (img_details.width / 50).toString();
    let font_size = (img_details.width / 5);
    let font_size_str = font_size.toString() + "px";
    let color = "#991111"
    text_ctx.textAlign = "center";
    text_ctx.font = '900 ' + font_size_str + ' Courier New';
    text_ctx.fillStyle = color;
    let txt = caption.toUpperCase().trim();
    let txt_w = text_ctx.measureText(txt).width;
    let rect_width = 1.15 * txt_w;
    let rect_x = (img_details.width*1.5 - rect_width)/2;
    let rect_height;
    let rect_y;
    if (/^[A-Za-z0-9 .,!"'?$]*$/.test(txt)) {
      rect_height = font_size * 0.9;
      rect_y = font_size*1.3 + line_width/2;
    } else {
      rect_height = font_size * 1.3;
      rect_y = font_size*1.05 + line_width/2;
    }
    text_ctx.translate(rect_width/2 + rect_x, rect_height/2 + rect_y);
    text_ctx.rotate(-Math.PI/8);
    text_ctx.translate(-(rect_width/2 + rect_x), -(rect_height/2 + rect_y));
    text_ctx.globalAlpha = 0.8;
    text_ctx.beginPath();
    text_ctx.lineWidth = line_width;
    text_ctx.strokeStyle = color;
    text_ctx.rect(rect_x, rect_y, rect_width, rect_height);
    text_ctx.stroke();
    text_ctx.fillText(txt, (1.5 * img_details.width) / 2, font_size * 2.1);

    // Apply text and posts
    ctx.drawImage(text_can,
      img_details.width/2 - (1.5*img_details.width)/2,
      img_details.height / 2 - rect_y - rect_height/2,
      img_details.width*1.5,
      img_details.height*1.5);
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'stamp.png');
    interaction.editReply({ files: [attachment], ephemeral: false });

  }
}

"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const Discord = require("discord.js");
const msg_limit = 20;


// Essential Functions
async function get_msgs(interaction) {
  return interaction.channel.messages.fetch({ limit: msg_limit});
}


function get_img_details(msgs) {
  let url = '';
  let width = 0;
  let height = 0;
  let shouldSkip = false; // Because we can't break
  msgs.forEach(msg => {
    if (msg.embeds.length > 0 && !shouldSkip) {
      if (
        msg.embeds[0].type == 'image' &&
        !(msg.embeds[0].thumbnail.url).includes('.webp')
      ) {
        url = msg.embeds[0].thumbnail.url;
        width = msg.embeds[0].thumbnail.width;
        height = msg.embeds[0].thumbnail.height;
        shouldSkip = true;
      }
    }
    if (msg.attachments.size > 0 && !shouldSkip) {
      if (['image/jpeg', 'image/png', 'image/gif'].includes(msg.attachments.first().contentType)) {
        url = msg.attachments.first().url;
        width = msg.attachments.first().width;
        height = msg.attachments.first().height;
        shouldSkip = true;
      }
    }
  })
  return({'url': url, 'width': width, 'height': height})
}


module.exports = {
  type: "private",
  cat: "utility",
  desc: "Swirl the last posted image.",
	data: new SlashCommandBuilder()
		.setName('swirl')
		.setDescription('Swirl the last posted image.')
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('Amount of swirl, -20 to 20. (default: 2)')
    ).addIntegerOption(option => option
      .setName('radius')
      .setDescription('Diameter of swirl as % of image width/height.')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let amount = 2;
    let radius = 90;
    if (!(interaction.options.getInteger('amount') == null)) {
      amount = interaction.options.getInteger('amount');
      if (amount < 0) {
        amount = Math.max(amount, -20);
      } else {
        amount = Math.min(amount, 20);
      }
    }
    if (!(interaction.options.getInteger('radius') == null)) {
      radius = interaction.options.getInteger('radius');
    }

    let msgs = await get_msgs(interaction);
    let img_details = get_img_details(msgs);
    const canvas = Canvas.createCanvas(img_details.width, img_details.height);
    const ctx = canvas.getContext('2d');
    const img = await Canvas.loadImage(img_details.url);
    ctx.drawImage(img, 0, 0, img_details.width, img_details.height);
    let img_data = ctx.getImageData(0, 0, img_details.width, img_details.height);
    let new_img_data = ctx.getImageData(0, 0, img_details.width, img_details.height);

    let t_radius = Math.floor(
      Math.min(img_details.height, img_details.width) * (radius / 100) / 2
    );
    let centerY =  Math.floor(img_details.height / 2);
    let centerX = Math.floor(img_details.width / 2);
    let r, alpha, angle, degrees, newX, newY, sourcePosition, destPosition;

    var originalPixels = img_data.data;
    var transformedPixels = new_img_data.data;

    for (let y = -t_radius; y < t_radius; ++y) {
      for (let x = -t_radius; x < t_radius; ++x) {
        if (x * x + y * y <= t_radius * t_radius) {
          destPosition = (y + centerY) * img_details.width + x + centerX;
          destPosition *= 4; // position as in array position

          r = Math.sqrt(x * x + y * y);
          alpha = Math.atan2(y, x);

          degrees = (alpha * 180.0) / Math.PI; // To degrees
          degrees += amount/2 * (t_radius - r) // The rotation amount

          // Transform back from polar coordinates to cartesian
          alpha = (degrees * Math.PI) / 180.0; // To Radians
          newY = Math.floor(r * Math.sin(alpha));
          newX = Math.floor(r * Math.cos(alpha));

          // Get the new pixel location
          sourcePosition = (newY + centerY) * img_details.width + newX + centerX;
          sourcePosition *= 4;

          transformedPixels[destPosition + 0] = originalPixels[sourcePosition + 0];
          transformedPixels[destPosition + 1] = originalPixels[sourcePosition + 1];
          transformedPixels[destPosition + 2] = originalPixels[sourcePosition + 2];
          transformedPixels[destPosition + 3] = originalPixels[sourcePosition + 3];

        }
      }
    }

    ctx.putImageData(new_img_data, 0, 0)
    let attach = new Discord.MessageAttachment(canvas.toBuffer(), 'swirl.png')
    await interaction.editReply({ files: [attach], ephemeral: false });

  }
}

"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const Discord = require("discord.js");
const msg_limit = 20;

// Key functions
function clamp(v) {
  if (v < 0) {return 0}
  if (v > 255) {return 255}
  return Math.round(v + 0.5);
}

function d_to_r(degrees) {
  return degrees * (Math.PI/180);
}

function getHueMatrix(degrees) {
  let matrix = [[1,0,0],[0,1,0],[0,0,1]];
  let cosA = Math.cos(d_to_r(degrees))
  let sinA = Math.sin(d_to_r(degrees))
  matrix[0][0] = cosA + (1.0 - cosA) / 3.0
  matrix[0][1] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[0][2] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[1][0] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[1][1] = cosA + 1./3.*(1.0 - cosA)
  matrix[1][2] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[2][0] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[2][1] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[2][2] = cosA + 1.0/3.0 * (1.0 - cosA)
  return matrix;
}

function applyHueMatrix(matrix, r, g, b) {
  let rx = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]
  let gx = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]
  let bx = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]
  return [clamp(rx), clamp(gx), clamp(bx)]
}

async function getShiftedAttachment(img_data, new_img_data, height, width, angle, filename, ctx, canvas) {
  for (let i = 0; i < height * width; i++) {
    let matrix = getHueMatrix(angle);
    let pos = i * 4;
    let new_rgb = applyHueMatrix(matrix, img_data.data[pos], img_data.data[pos+1], img_data.data[pos+2])
    new_img_data.data[pos] = new_rgb[0];
    new_img_data.data[pos+1] = new_rgb[1];
    new_img_data.data[pos+2] = new_rgb[2];
  }
  ctx.putImageData(new_img_data, 0, 0)
  let attach = new Discord.MessageAttachment(canvas.toBuffer(), filename);
  return attach;
}

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
      } else if (msg.embeds[0].type == 'rich') {
        if (msg.embeds[0].image !== null && !(msg.embeds[0].image.url.includes('.webp'))) {
          url = msg.embeds[0].image.url;
          width = msg.embeds[0].image.width;
          height = msg.embeds[0].image.height;
          shouldSkip = true;
        } else if (msg.embeds[0].thumbnail !== null && !(msg.embeds[0].thumbnail.url.includes('.webp'))) {
          url = msg.embeds[0].thumbnail.url;
          width = msg.embeds[0].thumbnail.width;
          height = msg.embeds[0].thumbnail.height;
          shouldSkip = true;
        }
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
  desc: "Shift the hue of the last image.",
	data: new SlashCommandBuilder()
		.setName('hue')
		.setDescription('Shift the hue of the last image.')
    .addIntegerOption(option => option
      .setName('angle')
      .setDescription('Amount of hue shift, 0 to 360. (default: 120)')
      .setRequired(true)
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let angle = interaction.options.getInteger('angle') ?? 120;

    let msgs = await get_msgs(interaction);
    let img_details = get_img_details(msgs);
    if (img_details.width * img_details.height > 2000 * 2000) {
      interaction.editReply({ content: "Too big. :(", ephemeral: false });
      return;
    }
    const canvas = Canvas.createCanvas(img_details.width, img_details.height);
    const ctx = canvas.getContext('2d');
    const img = await Canvas.loadImage(img_details.url);
    ctx.drawImage(img, 0, 0, img_details.width, img_details.height);
    let img_data = ctx.getImageData(0, 0, img_details.width, img_details.height);
    let new_img_data = ctx.getImageData(0, 0, img_details.width, img_details.height);

    let attach = await getShiftedAttachment(img_data, new_img_data, img_details.height, img_details.width, angle, 'hue_shift.png', ctx, canvas)
    await interaction.editReply({ files: [attach], ephemeral: false });

  }
}

"use strict";

// Define Constants
const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const msg_limit = 20;


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
      if (msg.embeds[0].type == 'image') {
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


async function create_mirror_attachment(url, width, height, direction) {
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const img = await Canvas.loadImage(url);
  ctx.drawImage(img, 0, 0, width, height);
  if (direction == 'west' || direction == 'east') {
    ctx.scale(-1, 1);
    if (direction  == 'east') {
      ctx.drawImage(
        img,
        width/2, 0, // Start at width/2 from the left, 0 from the top
        width/2, height, // Get width/2 x height crop on source image
        -width/2, 0, // Place the result width/2 across, 0 from top on canvas
        width/2, height // Should be w/2 wide, height tall (scale)
      );
    } else {
      ctx.drawImage(
        img,
        0, 0,
        width/2, height,
        -width, 0,
        width/2, height
      );
    }
  } else {
    ctx.scale(1, -1);
    if (direction == 'south') {
      ctx.drawImage(
        img,
        0, height/2,
        width, height/2,
        0, -height/2,
        width, height/2
      );
    } else {
      ctx.drawImage(
        img,
        0, 0,
        width, height/2,
        0, -height,
        width, height/2
      );
    }
  }
  return(new Discord.MessageAttachment(canvas.toBuffer(), 'mirror.png'))
}


module.exports = {
  type: "private",
  cat: "utility",
  desc: "Mirror the last posted image.",
	data: new SlashCommandBuilder()
		.setName('mirror')
		.setDescription('Mirror the last posted image.')
    .addStringOption(option => option
      .setName('direction')
      .setDescription('Image half to be duplicated.')
      .addChoices({name:'north', value:'north'})
      .addChoices({name:'south', value:'south'})
      .addChoices({name:'east', value:'east'})
      .addChoices({name:'west', value:'west'})
    ),
	async execute(interaction) {
    let direction = 'west';
    if (!(interaction.options.getString('direction') == null)) {
      direction = interaction.options.getString('direction');
    }
    let msgs = await get_msgs(interaction);
    let img_details = get_img_details(msgs);
    let attach = await create_mirror_attachment(
      img_details.url,
      img_details.width,
      img_details.height,
      direction
    );
    interaction.reply({ files: [attach], ephemeral: false });
  }
}

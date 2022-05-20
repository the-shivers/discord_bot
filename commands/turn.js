"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const Discord = require("discord.js");
var im = require('imagemagick');
// const { Buffer } from 'node:buffer';
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
  desc: "Flip image back and forth.",
	data: new SlashCommandBuilder()
		.setName('turn')
		.setDescription('Flip image back and forth.')
    .addIntegerOption(option => option
      .setName('delay')
      .setDescription('Centiseconds per frame, lower is faster (default: 3).')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let y = interaction.options.getInteger('delay') ?? 3;
    let img_details = await get_img_details(await get_msgs(interaction));
    console.log(img_details);
    im.convert([img_details.url, '-set', '-delay', '3', '-dispose', 'previous',
        '(', '+clone', '+repage', ')', '(', '-clone', '0', '-flop', ')',
        '-delete', '0', '-layers', 'Optimize', '-loop', '0', 'gif:-'],
    function(err, stdout) {
      if (err) {throw err}
      const buf1 = Buffer.from(stdout, 'binary');
      let attach = new Discord.MessageAttachment(buf1, 'ca.gif')
      interaction.editReply({ files: [attach], ephemeral: false });
    });
  }
}

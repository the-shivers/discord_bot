"use strict";

const Discord = require("discord.js");
const im = require('imagemagick');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');

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
    await interaction.deferReply();
    let direction = interaction.options.getString('direction') ?? 'west';
    let img_details = await get_img_details(await get_msgs(interaction));
    if (img_details.width * img_details.height > 2000 * 2500) {
      interaction.editReply("Sorry, that image is too big for me to mirror :(")
      return;
    }
    console.log(img_details);
    let args = [];
    if (direction === 'north') {
      args = [
        img_details.url,
        '-gravity', 'north', '(', '-clone', '0', '-crop', `${img_details.width}x${Math.ceil(img_details.height/2)}+0+0`, ')',
        '-gravity', 'south', '(', '-clone', '0', '-flip', '-crop', `${img_details.width}x${Math.floor(img_details.height/2)}+0+0`, ')',
        '-delete', '0', '-append', '-'
      ]
    } else if (direction === 'south') {
      args = [
        img_details.url,
        '-gravity', 'north', '(', '-clone', '0', '-flip', '-crop', `${img_details.width}x${Math.ceil(img_details.height/2)}+0+0`, ')',
        '-gravity', 'south', '(', '-clone', '0', '-crop', `${img_details.width}x${Math.floor(img_details.height/2)}+0+0`, ')',
        '-delete', '0', '-append', '-'
      ]
    } else if (direction === 'west') {
      args = [
        img_details.url,
        '-gravity', 'west', '(', '-clone', '0', '-crop', `${Math.ceil(img_details.width/2)}x${img_details.height}+0+0`, ')',
        '-gravity', 'east', '(', '-clone', '0', '-flop', '-crop', `${Math.floor(img_details.width/2)}x${img_details.height}+0+0`, ')',
        '-delete', '0', '+append', '-'
      ]
    } else if (direction === 'east') {
      args = [
        img_details.url,
        '-gravity', 'west', '(', '-clone', '0', '-flop', '-crop', `${Math.ceil(img_details.width/2)}x${img_details.height}+0+0`, ')',
        '-gravity', 'east', '(', '-clone', '0', '-crop', `${Math.floor(img_details.width/2)}x${img_details.height}+0+0`, ')',
        '-delete', '0', '+append', '-'
      ]
    }
    im.convert(args,
    function(err, stdout) {
      if (err) {
        console.log("error", err.message); throw err;
      }
      const buf = Buffer.from(stdout, 'binary');
      let attach = new Discord.MessageAttachment(buf, 'mirror.png')
      interaction.editReply({ files: [attach], ephemeral: false });
    });
  }
}

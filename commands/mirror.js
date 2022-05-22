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
      .addChoices({name:'north', value:'south'})
      .addChoices({name:'south', value:'north'})
      .addChoices({name:'east', value:'west'})
      .addChoices({name:'west', value:'east'})
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
    let x, y, flipflop;
    if (direction == 'west' || direction == 'east') {
      x = img_details.width/2;
      y = img_details.height;
      flipflop = '-flop'
    } else {
      x = img_details.width;
      y = img_details.height/2;
      flipflop = '-flip'
    }
    im.convert([img_details.url, '-gravity', direction, '(', '+clone', flipflop, '-crop', `${x}x${y}+0+0`, ')', '-composite', '-'],
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

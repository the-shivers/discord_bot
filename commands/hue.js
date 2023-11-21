"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require("discord.js");
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');
const im = require('imagemagick');

module.exports = {
  type: "private",
  cat: "utility",
  desc: "Shift the hue of the last image.",
	data: new SlashCommandBuilder()
		.setName('hue')
		.setDescription('Shift the hue of the last image.')
    .addIntegerOption(option => option
      .setName('angle')
      .setDescription('Amount of hue shift, 0 to 200. 100 is no change. (default: 50)')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let angle = interaction.options.getInteger('angle') ?? 120;
    let img_details = await get_img_details(await get_msgs(interaction));
    console.log(img_details)
    if (img_details.width * img_details.height > 5000 * 5000) {
      interaction.editReply("Sorry, that image is too big for me to hue :(")
      return;
    }
    im.convert([img_details.url, '-modulate', `100,100,${angle}`, '-'],
    function(err, stdout) {
      if (err) {
        console.log("error", err.message); throw err;
      }
      const buf1 = Buffer.from(stdout, 'binary');
      let attach = new Discord.MessageAttachment(buf1, 'hue.png')
      interaction.editReply({ files: [attach], ephemeral: false });
    });
  }
}

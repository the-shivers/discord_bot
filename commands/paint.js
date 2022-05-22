"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require("discord.js");
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');
const im = require('imagemagick');

module.exports = {
  type: "private",
  cat: "utility",
  desc: "Paint filter the last image.",
	data: new SlashCommandBuilder()
		.setName('paint')
		.setDescription('Oil paint filter the last image.')
    .addIntegerOption(option => option
      .setName('radius')
      .setDescription('Larger for broader paint strokes. In pixels.')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let radius = interaction.options.getInteger('radius') ?? 10;
    let img_details = await get_img_details(await get_msgs(interaction));
    console.log(img_details)
    if (img_details.width * img_details.height > 2000 * 2500) {
      interaction.editReply("Sorry, that image is too big for me to paint :(")
      return;
    }
    im.convert([img_details.url, '-paint', radius.toString(), '-'],
    function(err, stdout) {
      if (err) {
        console.log("error", err.message); throw err;
      }
      const buf1 = Buffer.from(stdout, 'binary');
      let attach = new Discord.MessageAttachment(buf1, 'paint.png')
      interaction.editReply({ files: [attach], ephemeral: false });
    });
  }
}

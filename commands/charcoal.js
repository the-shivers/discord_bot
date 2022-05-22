"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require("discord.js");
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');
const im = require('imagemagick');

module.exports = {
  type: "private",
  cat: "utility",
  desc: "Charcoal filter the last image.",
	data: new SlashCommandBuilder()
		.setName('charcoal')
		.setDescription('Charcoal filter the last image.')
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('No idea how this works, pick a number.')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let amount = interaction.options.getInteger('amount') ?? 10;
    let img_details = await get_img_details(await get_msgs(interaction));
    console.log(img_details)
    if (img_details.width * img_details.height > 2000 * 2500) {
      interaction.editReply("Sorry, that image is too big for me to charcoal :(")
      return;
    }
    im.convert([img_details.url, '-charcoal', amount.toString(), '-'],
    function(err, stdout) {
      if (err) {
        console.log("error", err.message); throw err;
      }
      const buf1 = Buffer.from(stdout, 'binary');
      let attach = new Discord.MessageAttachment(buf1, 'charcoal.png')
      interaction.editReply({ files: [attach], ephemeral: false });
    });
  }
}

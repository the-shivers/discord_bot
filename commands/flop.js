"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require("discord.js");
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');
const im = require('imagemagick');

module.exports = {
  type: "private",
  cat: "utility",
  desc: "Flip image horizontally.",
	data: new SlashCommandBuilder()
		.setName('flop')
		.setDescription('Flip image horizontally.'),
	async execute(interaction) {
    await interaction.deferReply();
    let img_details = await get_img_details(await get_msgs(interaction));
    console.log(img_details)
    if (img_details.width * img_details.height > 2000 * 2500) {
      interaction.editReply("Sorry, that image is too big for me to flop :(")
      return;
    }
    im.convert([img_details.url, '-flop', '-'],
    function(err, stdout) {
      if (err) {
        console.log("error", err.message); throw err;
      }
      const buf1 = Buffer.from(stdout, 'binary');
      let attach = new Discord.MessageAttachment(buf1, 'flop.png')
      interaction.editReply({ files: [attach], ephemeral: false });
    });
  }
}

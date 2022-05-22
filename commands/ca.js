"use strict";

const Discord = require("discord.js");
const im = require('imagemagick');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');


module.exports = {
  type: "private",
  cat: "utility",
  desc: "Fuck up the image or something.",
	data: new SlashCommandBuilder()
		.setName('ca')
		.setDescription('Liquid resize or something.')
    .addIntegerOption(option => option
      .setName('x')
      .setDescription('X squish, 1 to 100. (default: 50, lower is crazier)')
    ).addIntegerOption(option => option
      .setName('y')
      .setDescription('Y squish, 1 to 100. (default: 50, lower is crazier)')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let x = interaction.options.getInteger('x') ?? 50;
    let y = interaction.options.getInteger('y') ?? x;
    let img_details = await get_img_details(await get_msgs(interaction));
    if (img_details.width * img_details.height > 2000 * 2500) {
      interaction.editReply("Sorry, that image is too big for me to ca :(")
      return;
    }
    console.log(img_details);
    im.convert([img_details.url, '-liquid-rescale', `%${x}x%${y}`, '-resize', `${img_details.width}x${img_details.height}`, '-'],
    function(err, stdout) {
      if (err) {
        console.log("error", err.message); throw err;
      }
      const buf1 = Buffer.from(stdout, 'binary');
      let attach = new Discord.MessageAttachment(buf1, 'ca.png')
      interaction.editReply({ files: [attach], ephemeral: false });
    });
  }
}

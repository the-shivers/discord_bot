"use strict";

const Discord = require("discord.js");
const im = require('imagemagick');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');


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
    if (img_details.width * img_details.height > 2000 * 2500) {
      interaction.editReply("Sorry, that image is too big for me to ca :(")
      return;
    }
    im.convert(['-set', 'dispose', 'background', img_details.url, '-set', '-delay', '3',
        '(', '+clone', '-flop', ')', '-loop', '0', 'gif:-'],
    function(err, stdout) {
      if (err) {throw err}
      const buf1 = Buffer.from(stdout, 'binary');
      let attach = new Discord.MessageAttachment(buf1, 'turn.gif')
      interaction.editReply({ files: [attach], ephemeral: false });
    });
  }
}

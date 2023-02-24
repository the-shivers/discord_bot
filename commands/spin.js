"use strict";

const Discord = require("discord.js");
const im = require('imagemagick');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');




module.exports = {
  type: "private",
  cat: "utility",
  desc: "Rotate the image.",
	data: new SlashCommandBuilder()
		.setName('spin')
		.setDescription('Like a record, baby!')
    .addIntegerOption(option => option
      .setName('delay')
      .setDescription('Centiseconds per frame, lower is faster (1-200, default: 3).')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let delay = interaction.options.getInteger('delay') ?? 3;
    delay = Math.min(Math.max(delay, 1), 200).toString();
    let img_details = await get_img_details(await get_msgs(interaction));
    console.log(img_details);
    if (img_details.height * img_details.width > 2000 * 2000) {
      interaction.editReply("I'm too stupid to spin images that big. :(");
      return;
    }

    // Compose ridiculous image magick command
    let first_args = [
      img_details.url, '-alpha', 'set', '(', '+clone', '-distort', 'DePolar', '0',
      '-virtual-pixel', 'HorizontalTile', '-background', 'None', '-distort', 'Polar', '0', ')',
      '-compose', 'Dst_In', '-composite', '-trim', '+repage'
    ];
    let args = ['-alpha', 'on', '(', '+clone', '-scale', '256x256>', '-scale', '256x256<', ')', '-delete', '0', '(', '-size', '256x256', 'xc:none', '-fill', 'White', '-draw', 'circle 128,128 128,0', ')', '-compose', 'copyopacity', '-background', 'White'];
    for (let i = 0; i < 360; i += 20) {
      args = args.concat(['(', '-clone', '0', '-rotate', i.toString(), '-crop', '256x256+0+0!', '-clone', '1', '-composite', ')']);
    }
    args = args.concat(['-compose', 'srcover', '-delete', '0', '-delete', '0', '-delay', delay, '-set', 'delay', delay, '-set', 'dispose', 'None', 'gif:-']);

    // Run command
    im.convert(first_args.concat(args),
      function(err, stdout) {
        if (err) {
          console.log(err);
          interaction.editReply("ImageMagick messed it up!");
        } else {
          const buf1 = Buffer.from(stdout, 'binary');
          let attach = new Discord.MessageAttachment(buf1, 'spin.gif')
          interaction.editReply({ files: [attach], ephemeral: false });
        }
      }
    )
  }
}

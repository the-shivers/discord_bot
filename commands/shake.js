"use strict";

const Discord = require("discord.js");
const im = require('imagemagick');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { get_msgs, get_img_details } = require('../assets/img_manip/funcs.js');




module.exports = {
  type: "private",
  cat: "utility",
  desc: "Shake the image.",
	data: new SlashCommandBuilder()
		.setName('shake')
		.setDescription('Shake the last image.')
    .addIntegerOption(option => option
      .setName('delay')
      .setDescription('Centiseconds per frame, lower is faster (1-200, default: 2).')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let delay = interaction.options.getInteger('delay') ?? 2;
    delay = Math.min(Math.max(delay, 1), 200).toString();
    let img_details = await get_img_details(await get_msgs(interaction));
    console.log(img_details);
    if (img_details.height * img_details.width > 2000 * 2000) {
      interaction.editReply("I'm too stupid to shake images that big. :(");
      return;
    }

    // Compose ridiculous image magick command
    let args = [
  		'canvas:none',
  		'-size', '512x512!',
  		'-resize', '512x512!',
  		'-draw', `image over -60,-60 640,640 "${img_details.url}"`,
  		'(',
  			'canvas:none',
  			'-size', '512x512!',
  			'-draw', `image over -45,-50 640,640 "${img_details.url}"`,
  		')',
  		'(',
  			'canvas:none',
  			'-size', '512x512!',
  			'-draw', `image over -50,-45 640,640 "${img_details.url}"`,
  		')',
  		'(',
  			'canvas:none',
  			'-size', '512x512!',
  			'-draw', `image over -45,-65 640,640 "${img_details.url}"`,
  		')',
  		'-layers', 'Optimize',
  		'-set', 'delay', delay,
	    'gif:-'
    ]

    // Run command
    im.convert(args,
      function(err, stdout) {
        if (err) {
          console.log(err);
          interaction.editReply("ImageMagick messed it up!");
        } else {
          const buf1 = Buffer.from(stdout, 'binary');
          let attach = new Discord.MessageAttachment(buf1, 'shake.gif')
          interaction.editReply({ files: [attach], ephemeral: false });
        }
      }
    )
  }
}

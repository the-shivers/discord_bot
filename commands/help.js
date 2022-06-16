const { SlashCommandBuilder } = require('@discordjs/builders');

let help_str = `\
__**Utility Commands**__
\`/av\` - See someone's avatar.
\`/bi\` - Find a picture with Bing.
\`/bible\` - Get down with the Lord.
\`/coin\` - Flip a coin!
\`/e621\` - Find an image on e621.
\`/forecast\` - Weather forecast for a location.
\`/gi\` - Find a picture with Google.
\`/help\` - See this message.
\`/ping\` - Check if bot is alive.
\`/prune\` - Delete messages. Be careful!
\`/remind\` - Set a reminder.
\`/rename\` - Change someone's nickname!
\`/roll\` - Roll dice!
\`/ud\` - Consult Urban Dictionary.
\`/wa\` - Consult Wolfram Alpha.
\`/weather\` - Weather for a location.

__**Image Manipulation**__
\`/ca\` - Liquid resize last picture.
\`/charcoal\` - Ugly charcoal version of last pictrue.
\`/flip\` - Flip last picture vertically.
\`/flop\` - Flip last picture horizontally.
\`/hue\` - Shift last picture's colors.
\`/implode\` - Implode or explode last picture.
\`/mirror\` - Mirror the last picture.
\`/neg\` - Invert the last picture.
\`/paint\` - Oil paint the last picture.
\`/posterize\` - Limit colors of last picture.
\`/rotate\` - Rotate last picture.
\`/rotate\` - Shake last picture.
\`/spin\` - Spin last picture.
\`/stamp\` - Stamp message on last picture.
\`/swirl\` - Swirl last picture.
\`/turn\` - Flip last picture back and forth.

__**Fun and Games**__
\`/ai\` - Let AI finish a story fragment.
\`/grid\` - Compare server members.
\`/hurt\` - Hurt or heal others.
\`/mock\` - (Context Menu) Make fun of a message.
\`/pcatch\` - Basic command for Pokemon game (see /phelp).
\`/smack\` - (Context Menu) Smack someone!
\`/sona\` - Generate a silly fursona.
\`/story\` - Tell a long story using AI.
\`/tarot\` - Have your fortune told.
\`/wwtbam\` - Play an elaborate trivia game!`;

module.exports = {
  type: "public",
  cat: "utility",
  desc: "Learn more about the bot's functions.",
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Learn about bot commands.'),
	async execute(interaction) {
    interaction.reply(help_str)
  }
};

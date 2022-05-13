const { SlashCommandBuilder } = require('@discordjs/builders');

let help_str = 'heres ur help lol';

module.exports = {
  type: "public",
  cat: "utility",
  desc: "Learn more about the bot's functions.",
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Learn about bot commands.'),
	async execute(interaction) {interaction.reply(help_str)}
};

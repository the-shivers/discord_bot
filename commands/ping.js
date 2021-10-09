const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	type: "public",
  cat: "utility",
  desc: "Ping the bot to check if it's functioning. Or for fun.",
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};

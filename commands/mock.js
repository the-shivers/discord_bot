const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Mock someone's message.",
	data: new ContextMenuCommandBuilder()
		.setName('mock')
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {
		let msg = await interaction.channel.messages.fetch(interaction.targetId);
		let reply = '';
		for (let i = 0; i < msg.content.length; i++) {
			if (i % 2 === 0) {
				reply += msg.content[i].toUpperCase();
			} else {
				reply += msg.content[i].toLowerCase();
			}
		}
		await interaction.reply(reply);
	},
};

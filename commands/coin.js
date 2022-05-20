"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Flip a coin.",
	data: new SlashCommandBuilder()
		.setName('coin')
		.setDescription('Flip a coin.'),
	async execute(interaction) {
    interaction.reply(Math.random() < .5 ? 'heads' : 'tails')
  }
}

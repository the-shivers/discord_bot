"use strict";

// TO DO: fix genderless thing

const { SlashCommandBuilder } = require('@discordjs/builders');
const { deactivate_all } = require('../assets/pokemon/poke_funcs.js');

module.exports = {
	type: "private",
  cat: "games",
  desc: "Flush pokemon users.",
	data: new SlashCommandBuilder()
		.setName('pflush')
		.setDescription('Refresh pokemon command usage tracking.'),
	async execute(interaction) {
    deactivate_all();
    interaction.reply("Pokemon command usage refreshed.");
  }
}

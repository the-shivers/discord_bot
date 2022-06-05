"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const { async_query } = require('../db/scripts/db_funcs.js')

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Set location for weather and forecast data.",
	data: new SlashCommandBuilder()
		.setName('setloc')
		.setDescription('Set location for weather and forecast data.')
    .addStringOption(option => option
      .setName('location')
      .setDescription("The location to set. Test afterwards with /weather!")
      .setRequired(true)
    ),
	async execute(interaction) {
    let location = interaction.options.getString('location');
    if (location.length > 120) {
      interaction.reply("How about trying a real location?")
      return;
    }
    const query = `
      INSERT INTO data.setloc
      (userId, username, locString)
        VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        username = ?,
        locString = ?;`;
    const values = [interaction.user.id, interaction.user.username, location];
    let result = await async_query(query, values.concat(values.slice(1)));
    interaction.reply(`Location set to ${location}! Remember to test it with /weather or /forecast!`)
	}
};

"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')


module.exports = {
	type: "private",
  cat: "games",
  desc: "Release a pokemon.",
	data: new SlashCommandBuilder()
		.setName('prelease')
		.setDescription('Release a pokemon.')
    .addIntegerOption(option => option
      .setName('slot')
      .setDescription('The slot of the pokemon to release.')
      .addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
      .setRequired(true)
    ),
	async execute(interaction) {
    let slot = interaction.options.getInteger('slot')
    let query = 'SELECT * FROM data.pokemon_status WHERE userId = ? AND owned = 1 ORDER BY epoch ASC;';
    let values = [interaction.user.id];
    let status = await async_query(query, values);
    if (slot > status.length) {
      interaction.reply("You don't have a pokemon in that slot!")
    } else {
      let release_query = 'UPDATE data.pokemon_status SET owned = 0 WHERE userId = ? AND owned = 1 AND nick = ? AND name = ?';
      let release_values = [interaction.user.id, status[slot - 1].nick, status[slot - 1].name];
      await async_query(release_query, release_values);
      interaction.reply(`Goodbye ${status[slot - 1].name}! Other slots have updated.`);
    }
	}
};

"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')


module.exports = {
	type: "private",
  cat: "games",
  desc: "Rename a pokemon.",
	data: new SlashCommandBuilder()
		.setName('prename')
		.setDescription('Rename a pokemon.')
    .addIntegerOption(option => option
      .setName('slot')
      .setDescription('The slot of the pokemon to rename.')
			.addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
			.addChoices({name:'7', value:7}).addChoices({name:'8', value:8})
			.addChoices({name:'9', value:9}).addChoices({name:'10', value:10})
			.addChoices({name:'11', value:11}).addChoices({name:'12', value:12})
			.addChoices({name:'13', value:13}).addChoices({name:'14', value:14})
			.addChoices({name:'15', value:15}).addChoices({name:'16', value:16})
			.addChoices({name:'17', value:17}).addChoices({name:'18', value:18})
      .setRequired(true)
    ).addStringOption(option => option
      .setName('nickname')
      .setDescription('The new name.').setRequired(true)
    ),
	async execute(interaction) {
    let slot = interaction.options.getInteger('slot')
    let nick = interaction.options.getString('nickname')
    nick = nick.slice(0, 31);
    let query = 'SELECT * FROM data.pokemon_encounters WHERE userId = ? AND owned = 1 ORDER BY slot ASC;';
    let values = [interaction.user.id];
    let status = await async_query(query, values);
    if (slot > status.length) {
      interaction.reply("You don't have a pokemon in that slot!")
    } else {
      let rename_query = 'UPDATE data.pokemon_encounters SET nick = ? WHERE id = ?';
      let rename_vals = [nick, status[slot-1].id];
      await async_query(rename_query, rename_vals);
      interaction.reply(`Pokemon renamed! Your ${status[slot-1].name} is now known as ${nick}!`);
    }
	}
};

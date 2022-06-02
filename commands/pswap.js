"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')


module.exports = {
	type: "private",
  cat: "games",
  desc: "Swap two pokemon's slots on your team.",
	data: new SlashCommandBuilder()
		.setName('pswap')
		.setDescription("Swap two pokemon's slots on your team.")
    .addIntegerOption(option => option
      .setName('slot1')
      .setDescription('The slot of the first pokemon to be swapped.')
			.addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
			.addChoices({name:'7', value:7}).addChoices({name:'8', value:8})
			.addChoices({name:'9', value:9}).addChoices({name:'10', value:10})
			.addChoices({name:'11', value:11}).addChoices({name:'12', value:12})
      .setRequired(true)
    ).addIntegerOption(option => option
      .setName('slot2')
      .setDescription('The slot of the second pokemon to be swapped.')
			.addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
			.addChoices({name:'7', value:7}).addChoices({name:'8', value:8})
			.addChoices({name:'9', value:9}).addChoices({name:'10', value:10})
			.addChoices({name:'11', value:11}).addChoices({name:'12', value:12})
      .setRequired(true)
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let slot1 = interaction.options.getInteger('slot1');
    let slot2 = interaction.options.getInteger('slot2');
    let query = 'SELECT * FROM data.pokemon_encounters WHERE userId = ? AND owned = 1 ORDER BY slot ASC;';
    let values = [interaction.user.id];
    let team = await async_query(query, values);
    if (slot1 > team.length || slot2 > team.length) {
      interaction.editReply("You don't have a pokemon in that slot!")
      return
    } else if (slot1 == slot2) {
      interaction.editReply("That doesn't make any sense!")
      return
    }
    let update_q = 'UPDATE data.pokemon_encounters SET slot = ? WHERE id = ?;';
    let update_v1 = [team[slot1-1].slot, team[slot2-1].id];
    let update_v2 = [team[slot2-1].slot, team[slot1-1].id];
    await async_query(update_q, update_v1);
    await async_query(update_q, update_v2);
    interaction.editReply(`Pokemon swapped! Your ${team[slot1-1].name} is now in slot ${slot2} and your ${team[slot2-1].name} is now in slot ${slot1}!`);
  }
}

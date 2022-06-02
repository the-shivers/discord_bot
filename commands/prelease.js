"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const rvals = require('../assets/pokemon/poke_info.json').release_values;


module.exports = {
	type: "private",
  cat: "games",
  desc: "Release a pokemon, earning some money.",
	data: new SlashCommandBuilder()
		.setName('prelease')
		.setDescription('Release a pokemon, earning some money.')
    .addIntegerOption(option => option
      .setName('slot')
      .setDescription('The slot of the pokemon to release.')
			// Why yes, I do code professionally, however SlashCommandBuilder you tell?
      .addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
			.addChoices({name:'7', value:7}).addChoices({name:'8', value:8})
			.addChoices({name:'9', value:9}).addChoices({name:'10', value:10})
			.addChoices({name:'11', value:11}).addChoices({name:'12', value:12})
      .setRequired(true)
    ),
	async execute(interaction) {
    let slot = interaction.options.getInteger('slot')
    let query = 'SELECT p.*, pd.frequency FROM data.pokemon_encounters AS p LEFT JOIN data.pokedex AS pd ON p.pokemonId = pd.pokemonId WHERE userId = ? AND owned = 1 ORDER BY slot ASC;';
    let values = [interaction.user.id];
    let status = await async_query(query, values);
    if (slot > status.length) {
      interaction.reply("You don't have a pokemon in that slot!")
    } else {
      let release_query = 'UPDATE data.pokemon_encounters SET owned = 0 WHERE id = ?;';
      let release_values = [status[slot - 1].id];
      await async_query(release_query, release_values);
			let money = rvals[status[slot - 1].frequency]
			money = (status[slot - 1].isShiny == 1) ? money * 2 : money;
			let money_query = 'UPDATE data.pokemon_trainers SET cash = cash + ? WHERE userId = ?;'
			await async_query(money_query, [money, interaction.user.id]);
      interaction.reply(`Goodbye ${status[slot - 1].name}! Other slots have updated. You got ₽${money} for releasing them.`);
    }
	}
};

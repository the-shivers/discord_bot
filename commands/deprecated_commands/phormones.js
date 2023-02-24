"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const { activate_user, deactivate_user } = require('../assets/pokemon/poke_funcs.js');

module.exports = {
	type: "private",
  cat: "games",
  desc: "Change your pokemon's gender (sex) if you have the item.",
	data: new SlashCommandBuilder()
		.setName('phormones')
		.setDescription("Change your pokemon's gender (sex) if you have the item.")
    .addIntegerOption(option => option
      .setName('slot')
      .setDescription('The slot of the pokemon to affect.')
			.addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
			.addChoices({name:'7', value:7}).addChoices({name:'8', value:8})
			.addChoices({name:'9', value:9}).addChoices({name:'10', value:10})
			.addChoices({name:'11', value:11}).addChoices({name:'12', value:12})
			.addChoices({name:'13', value:13}).addChoices({name:'14', value:14})
			.addChoices({name:'15', value:15}).addChoices({name:'16', value:16})
			.addChoices({name:'17', value:17}).addChoices({name:'18', value:18})
			.addChoices({name:'19', value:19}).addChoices({name:'20', value:20})
			.addChoices({name:'21', value:21}).addChoices({name:'22', value:22})
			.addChoices({name:'23', value:23}).addChoices({name:'24', value:24})
      .setRequired(true)
    ),
	async execute(interaction) {
		if (!activate_user(interaction.user.id, 'lol')) {
      interaction.reply("You're already doing a command.")
      return;
    }
    let slot = interaction.options.getInteger('slot')
    let query = 'SELECT * FROM data.pokemon_encounters WHERE userId = ? AND owned = 1 ORDER BY slot ASC;';
    let values = [interaction.user.id];
    let status = await async_query(query, values);
    if (slot > status.length) {
      interaction.reply("You don't have a pokemon in that slot!")
			deactivate_user(interaction.user.id)
      return
    }
    let pokemon = status[slot-1]
    if (pokemon.gender == 'unknown') {
      interaction.reply("You can't change this pokemon's gender!")
			deactivate_user(interaction.user.id)
      return
    }
		let trainer_result = await async_query("SELECT * FROM data.pokemon_trainers WHERE userId = ?;", [interaction.user.id]);
		let trainer = trainer_result[0];
		if (trainer.hormones == 0) {
			interaction.reply("You don't have any hormones! Buy some with /pmart.");
			deactivate_user(interaction.user.id)
			return
		}
    let new_gender = (pokemon.gender == 'male') ? 'female' : 'male';
    let gender_query = 'UPDATE data.pokemon_encounters SET gender = ? WHERE id = ?';
    let gender_vals = [new_gender, pokemon.id];
    await async_query(gender_query, gender_vals);
		let trainer_query = 'UPDATE data.pokemon_trainers SET hormones = hormones - 1 WHERE userId = ?';
    let trainer_vals = [interaction.user.id];
    await async_query(trainer_query, trainer_vals);
    interaction.reply(`Pokemon changed! Your ${pokemon.name} is now ${new_gender}!`);
		deactivate_user(interaction.user.id)
  }
}

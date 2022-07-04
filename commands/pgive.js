"use strict";

// TO DO: fix genderless thing

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');
const Canvas = require('canvas');
const { async_query } = require('../db/scripts/db_funcs.js')
const { activate_user, deactivate_user } = require('../assets/pokemon/poke_funcs.js');


module.exports = {
	type: "private",
  cat: "games",
  desc: "Give a pokemon or money to someone!",
	data: new SlashCommandBuilder()
		.setName('pgive')
		.setDescription('Give a pokemon or money to someone!')
    .addUserOption(option => option
      .setName('target')
      .setDescription('Who to give to.')
      .setRequired(true)
    ).addIntegerOption(option => option
      .setName('slot')
      .setDescription('Which of your pokemon to give.')
      .addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
			.addChoices({name:'7', value:7}).addChoices({name:'8', value:8})
			.addChoices({name:'9', value:9}).addChoices({name:'10', value:10})
			.addChoices({name:'11', value:11}).addChoices({name:'12', value:12})
      .addChoices({name:'13', value:13}).addChoices({name:'14', value:14})
			.addChoices({name:'15', value:15}).addChoices({name:'16', value:16})
			.addChoices({name:'17', value:17}).addChoices({name:'18', value:18})
    ).addIntegerOption(option => option
      .setName('money')
      .setDescription('How much money to give.')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let user = interaction.user;
    let target = interaction.options.getUser('target');
    let slot = interaction.options.getInteger('slot') ?? 0;
    let money = interaction.options.getInteger('money') ?? 0;

    // First three checks.
    if (!activate_user(user.id, 'lol')) {
      interaction.editReply("You're already doing a command.")
      return;
    }
    if (!activate_user(target.id, 'lol')) {
      interaction.editReply("They're already doing a command.")
      deactivate_user(user.id)
      return;
    }
    if (money <= 0 && slot == 0) { //Handles negative money theft
      interaction.editReply("You must specify a Pokemon or some money to give!")
      deactivate_user(user.id)
      deactivate_user(target.id)
      return
    }
    if (money < 0) { //Handles negative money theft
      interaction.editReply("Money cannot be negative!")
      deactivate_user(user.user.id)
      deactivate_user(target.id)
      return
    }

    let query1 = "SELECT * FROM data.pokemon_encounters WHERE userId = ? AND owned = 1 ORDER BY slot ASC;";
    let query2 = "SELECT * FROM data.pokemon_trainers WHERE userId = ?;";
    let user_team = await async_query(query1, [user.id]);
    let user_data = await async_query(query2, [user.id]);
    let target_team = await async_query(query1, [target.id]);
    let target_data = await async_query(query2, [target.id]);

    console.log("slot", slot)
    console.log('user_team:\n', user_team)
    console.log('user_data:\n', user_data)
    console.log('target_team:\n', target_team)
    console.log('target_data:\n', target_data)
    console.log(slot > 0)
    console.log(target_team.length >= target_data.slots)

    // Remaining three checks.
    if (slot > 0) {
      if (slot > user_team.length) {
        interaction.editReply("You don't have a pokemon in that slot!")
        deactivate_user(user.id)
        deactivate_user(target.id)
        return
      } else if (target_team.length >= target_data[0].slots) {
        interaction.editReply("They don't have room for another Pokemon!")
        deactivate_user(user.id)
        deactivate_user(target.id)
        return
      }
    }
    if (money > 0 && user_data[0].cash < money) {
      interaction.editReply("You can't afford it!")
      deactivate_user(user.id)
      deactivate_user(target.id)
      return
    }

    if (money > 0 && slot > 0) {
      interaction.editReply(`You gave ₽${money} and ${user_team[slot-1].name} to ${target.username}! How generous!`)
      async_query(`UPDATE data.pokemon_encounters SET userId = ? WHERE id = ?`, [target.id, user_team[slot-1].id]);
      async_query(`UPDATE data.pokemon_trainers SET cash = cash + ? WHERE userId = ?`, [money, target.id]);
      async_query(`UPDATE data.pokemon_trainers SET cash = cash - ? WHERE userId = ?`, [money, user.id]);
      deactivate_user(user.id)
      deactivate_user(target.id)
      return
    } else if (money > 0) {
      interaction.editReply(`You gave ₽${money} to ${target.username}! How generous!`)
      async_query(`UPDATE data.pokemon_trainers SET cash = cash + ? WHERE userId = ?`, [money, target.id]);
      async_query(`UPDATE data.pokemon_trainers SET cash = cash - ? WHERE userId = ?`, [money, user.id]);
      deactivate_user(user.id)
      deactivate_user(target.id)
      return
    } else if (slot > 0) {
      interaction.editReply(`You gave ${user_team[slot-1].name} to ${target.username}! How generous!`)
      async_query(`UPDATE data.pokemon_encounters SET userId = ? WHERE id = ?`, [target.id, user_team[slot-1].id]);
      deactivate_user(user.id)
      deactivate_user(target.id)
      return
    }

	}
};

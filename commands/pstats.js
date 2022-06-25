"use strict";

// Constants
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const assets_dir = './assets/pokemon/';
const config = require('../assets/pokemon/poke_info.json')
const f = require('../funcs.js');

module.exports = {
  type: "private",
  cat: "games",
  desc: "See Pokemon trainer stats!",
	data: new SlashCommandBuilder()
		.setName('pstats')
		.setDescription('Show your Pokemon team!')
    .addUserOption(option => option
      .setName('target')
      .setDescription('Pokemon trainer to look at (defaults to your own)')
      .setRequired(false)
    ),
	async execute(interaction) {
    await interaction.deferReply();

    let user = interaction.options.getUser('target') ?? interaction.user;
    let userId = user.id;
    let encounters_q = 'SELECT pe.*, p.type1, p.type2, p.gen, p.frequency, p.species FROM data.pokemon_encounters AS pe JOIN data.pokedex AS p ON p.pokemonId = pe.pokemonId WHERE userId = ?;';
    let trainers_q = 'SELECT * FROM data.pokemon_trainers WHERE userId = ?;';
    let encounters_result = await async_query(encounters_q, [userId]);
    let trainer_result = await async_query(trainers_q, [userId]);
    let trainer = trainer_result[0];

    let total_encounters = 0;
    let total_attempts = 0;
    let total_catches = 0;
    let unique_seen_arr = [];
    let unique_caught_arr = [];
    let types = {}
    let oldest_epoch = 9999999999999999999999999;
    let oldest_mon = {};
    for (let i = 0; i < encounters_result.length; i++) {
      let encounter = encounters_result[i];
      if (encounter.epoch < oldest_epoch && encounter.owned == 1) {
        oldest_epoch = encounter.epoch;
        oldest_mon = encounter;
      }
      if (encounter.attempted != '' || (encounter.attempted == '' && encounter.caught == 0)) {
        total_encounters += 1;
      }
      total_attempts += (encounter.attempted != '') ? 1 : 0;
      total_catches += (encounter.attempted != '' && encounter.caught == 1) ? 1 : 0;
      if (!unique_seen_arr.includes(encounter.name)) {
        unique_seen_arr.push(encounter.name);
      }
      if (!unique_caught_arr.includes(encounter.name) && encounter.caught == 1) {
        unique_caught_arr.push(encounter.name);
      }
      if (encounter.type1 in types && (encounter.caught == 1 || encounter.attempted == 1)) {
        types[encounter.type1] += (encounter.owned == 1) ? 2 : 1;
      } else if (encounter.caught == 1 || encounter.attempted == 1) {
        types[encounter.type1] = (encounter.owned == 1) ? 2 : 1;
      }
      if (encounter.type2.length > 0 && encounter.type2 in types && (encounter.caught == 1 || encounter.attempted == 1)) {
        types[encounter.type2] += (encounter.owned == 1) ? 2 : 1;
      } else if (encounter.type2.length > 0 && (encounter.caught == 1 || encounter.attempted == 1)) {
        types[encounter.type2] = (encounter.owned == 1) ? 2 : 1;
      }
    }
    let best_type = Object.keys(types).reduce(function(a, b){ return types[a] > types[b] ? a : b });

    let desc = `You have seen \`${unique_seen_arr.length}\` and caught `
    desc += `\`${unique_caught_arr.length}\` Pokemon. Your favorite type is \`${best_type}\` and `
    desc += `\`${oldest_mon.nick} the ${oldest_mon.name}\` is your best friend. Your train `
    desc += `streak is currently \`${trainer.trainStreak}\`. You have \`₽${trainer.cash}\` to spend and \`${trainer.pokeballs}\` `
    desc += `Poke, \`${trainer.greatballs}\` Great, \`${trainer.ultraballs}\` Ultra and `
    desc += `\`${trainer.omegaballs}\` Omega Balls to catch with. You have \`${trainer.rareChances}\``
    desc += `Poke Radar uses and \`${trainer.hormones}\` hormones. Finally you have \`${trainer.slots}\` slots.`

    let filename = 'pokeball.gif';
    let img_src = assets_dir + filename;
    let image = new MessageAttachment(img_src, filename);

    let capture_stats = `\
    Capture Attempts: \`${total_attempts}\`
    Total Captures: \`${total_catches}\`
    Capture Rate: \`${(100 * total_catches / total_attempts).toFixed(1)}%\``;
    let encounter_stats = `\
    Encounters: \`${total_encounters}\`
    Capture Attempts: \`${total_attempts}\`
    Attempt Rate: \`${(100 * total_attempts / total_encounters).toFixed(1)}%\``;

    const embed = new MessageEmbed()
      .setTitle(`Trainer Profile: ${user.username}`)
      .setColor(config.types[best_type].color)
      .setDescription(desc)
      .setThumbnail('attachment://' + filename)
      .addField('Capture Stats', capture_stats, true)
      .addField('Encounter Stats', encounter_stats, true)
    interaction.editReply({ embeds: [embed], files: [image] })

  }
}

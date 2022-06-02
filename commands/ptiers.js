"use strict";

// Constants
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const config = require('../assets/pokemon/poke_info.json')

module.exports = {
  type: "private",
  cat: "games",
  desc: "See pokemon rarities!",
	data: new SlashCommandBuilder()
		.setName('ptiers')
		.setDescription('See pokemon rarities!')
    .addStringOption(option => option
      .setName('generation')
      .setDescription('Select generation to look at rarities within!')
      .addChoices({name:'Gen I', value:'I'}).addChoices({name:'Gen II', value:'II'})
      .addChoices({name:'Gen III', value:'III'}).addChoices({name:'Gen IV', value:'IV'})
      .addChoices({name:'Gen V', value:'V'}).addChoices({name:'Gen VI', value:'VI'})
      .addChoices({name:'Gen VII', value:'VII'})
      .setRequired(true)
    ).addStringOption(option => option
      .setName('order')
      .setDescription('How you want to see the Pokemon sorted (default: rarity).')
      .addChoices({name:'By Rarity Tier', value:'frequency'})
      .addChoices({name:'Alphabetically', value:'name'})
      .addChoices({name:'By Natl. Dex #', value:'pokemonId'})
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let generation = interaction.options.getString('generation');
    let order = interaction.options.getString('order') ?? 'frequency';
    let query = `SELECT * FROM data.pokedex WHERE gen = ? AND frequency > 0 ORDER BY ${order} ASC, pokemonId DESC;`;
    let tiers = await async_query(query, [generation]);
    if (tiers.length === 0) {
      interaction.editReply("Something went wrong and the query didn't return anything!");
      return;
    }

    let horz_bord = '+-------------'.repeat(2) + '+'
    let line;
    let full = horz_bord;
    for (let i = 0; i < tiers.length; i++) {
      line = '| ' + tiers[i].name.toUpperCase().padEnd(11, ' ') + ' | ';
      line += config.rarities[tiers[i].frequency.toString()].toUpperCase().padEnd(11, ' ') + ' |';
      full += '\n' + line;
    }
    full += '\n' + horz_bord;

    const embed = new MessageEmbed()
      .setTitle('Gen ' + generation + ' Rarity Tiers')
      .setColor('RED')
      .setDescription(`\`\`\`\n${full}\`\`\``);
    interaction.editReply({ embeds: [embed] })

	}
};

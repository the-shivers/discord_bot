"use strict";

// Constants
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const assets_dir = './assets/pokemon/images/';
const config = require('../assets/pokemon/poke_info.json')
const { getStats, getPokePic } = require('../assets/pokemon/poke_funcs.js');

module.exports = {
  type: "private",
  cat: "games",
  desc: "See one of your pokemon!",
	data: new SlashCommandBuilder()
		.setName('pview')
		.setDescription('Show your Pokemon team!')
    .addIntegerOption(option => option
      .setName('slot')
      .setDescription('The slot of the pokemon to view.')
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

    // Fetch information about Pokemon.
    let slot = interaction.options.getInteger('slot');
    let query1 = `
    SELECT
      ps.*,
      p.type1, p.type2, p.hp, p.attack, p.defense, p.spAttack, p.spDefense, p.speed,
      p.species, p.description, p.height, p.weight, p.egg1, p.egg2, p.frequency,
      p.evLevel, p.evIds
    FROM data.pokemon_encounters AS ps
    LEFT JOIN data.pokedex AS p
    ON ps.pokemonId = p.pokemonId
    WHERE userId = ? AND owned = 1
    ORDER BY slot ASC;`
    let values1 = [interaction.user.id]
    let team = await async_query(query1, values1);
    if (team.length === 0) {
      interaction.editReply("You don't have any Pokemon! Try catching one with `/pcatch`!");
      return;
    } else if (slot > team.length) {
      interaction.editReply("You don't have a pokemon in that slot!")
      return;
    }
    let pokemon = team[slot-1];
    let ev_id_array = pokemon.evIds.split('|');
    let ev_text = '';
    if (ev_id_array.length > 0) {
      ev_text = ' evolves into ';
      let name_arr = []
      let ev_query = `SELECT * FROM data.pokedex WHERE pokemonId IN (?${', ?'.repeat(ev_id_array.length - 1)});`;
      let ev_result = await async_query(ev_query, ev_id_array);
      for (let i = 0; i < ev_result.length; i++) {
        name_arr.push(ev_result[i].name);
      }
      ev_text += name_arr.join(', ').replace(/, ([^,]*)$/, ' or $1')
      ev_text += ` at level ${pokemon.evLevel}.`
    }

    // Generate components
    let author = '#' + pokemon.pokemonId.toString().padStart(3, '0');
    author += ' - ' + pokemon.name + ` (${pokemon.species})`
    let gender = ''
    if (pokemon.gender == 'male') {
      gender = '\\♂'
    } else if (pokemon.gender == 'female') {
      gender = '\\♀'
    }
    let title = pokemon.nick + gender + ` - Lvl. ${pokemon.level}`;
    let description = `*Rarity: ${config.rarities[pokemon.frequency.toString()]}.* `
    description += pokemon.description;
    let type2 = (pokemon.type2 != '') ? `, \`${pokemon.type2}\`` : '';
    let field1 = `\`${pokemon.type1}\`` + type2;
    let egg2 = (pokemon.egg2 != '') ? `, \`${pokemon.egg2}\`` : '';
    let field2 = `\`${pokemon.egg1}\`` + egg2;
    let field3 = `\`${pokemon.pokemonChar1}\`, \`${pokemon.pokemonChar2}\``;
    let color = config.types[pokemon.type1].color;
    let filename = pokemon.pokemonId.toString().padStart(3, '0') + '.png'
    let full_path = assets_dir + filename;
    let poke_pic = await getPokePic(full_path, filename, pokemon.shinyShift);

    // Generate stats block.
    let stats_block = "\n```";
    let stats = getStats(pokemon.epoch, pokemon.level, pokemon);
    for (var key of Object.keys(stats)) {
      stats_block += key.slice(0, 3).padStart(3, ' ') + ' ' + stats[key].val.toString().padStart(3, ' ');
      stats_block += ` ${stats[key].symb} |${'|'.repeat(Math.ceil(stats[key].val / 5))}\n`
    }
    stats_block = stats_block.slice(0,-1).toUpperCase() + '```'

    // Generate embed
    const embed = new MessageEmbed()
      .setTitle(title)
      .setColor(color)
      .setDescription(description + ev_text + stats_block)
      .setImage('attachment://poke_pic.png')
      .setAuthor({name: author})
      .setFooter({ text: `${(pokemon.experience * 100).toFixed(1)}% to next level` })
      .addFields(
        { name: 'Types', value: field1, inline: true },
        { name: 'Egg Groups', value: field2, inline: true },
        { name: 'Traits', value: field3, inline: true },
    	);
    interaction.editReply({ embeds: [embed], files: [poke_pic] })

	}
};

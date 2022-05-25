"use strict";

// Constants
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');
const { async_query } = require('../db/scripts/db_funcs.js')
const assets_dir = './assets/pokemon/images/';
const f = require('../funcs.js');
const config = require('../assets/pokemon/poke_info.json')
const { getStats } = require('../assets/pokemon/poke_funcs.js');

function clamp(v) {
  if (v < 0) {return 0}
  if (v > 255) {return 255}
  return Math.round(v + 0.5);
}

function d_to_r(degrees) {
  return degrees * (Math.PI/180);
}

function getHueMatrix(degrees) {
  let matrix = [[1,0,0],[0,1,0],[0,0,1]];
  let cosA = Math.cos(d_to_r(degrees))
  let sinA = Math.sin(d_to_r(degrees))
  matrix[0][0] = cosA + (1.0 - cosA) / 3.0
  matrix[0][1] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[0][2] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[1][0] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[1][1] = cosA + 1./3.*(1.0 - cosA)
  matrix[1][2] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[2][0] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[2][1] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[2][2] = cosA + 1.0/3.0 * (1.0 - cosA)
  return matrix;
}

function applyHueMatrix(matrix, r, g, b) {
  let rx = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]
  let gx = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]
  let bx = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]
  return [clamp(rx), clamp(gx), clamp(bx)]
}

async function getPokePic(full_path, filename, shinyShift) {
  const canvas = Canvas.createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  let img = await Canvas.loadImage(full_path);
  ctx.drawImage(img, 0, 0, 512, 512);
  if (shinyShift != 0) {
    let img_data = ctx.getImageData(0, 0, 512, 512);
    let new_img_data = ctx.getImageData(0, 0, 512, 512);
    for (let j = 0; j < 512 * 512; j++) {
      let matrix = getHueMatrix(shinyShift)
      let pos = j * 4;
      let new_rgb = applyHueMatrix(matrix, img_data.data[pos], img_data.data[pos+1], img_data.data[pos+2]);
      new_img_data.data[pos] = new_rgb[0];
      new_img_data.data[pos+1] = new_rgb[1];
      new_img_data.data[pos+2] = new_rgb[2];
    }
    ctx.putImageData(new_img_data, 0, 0)
  }
  let attach = new MessageAttachment(canvas.toBuffer(), 'poke_pic.png');
  return attach;
}


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
      .setRequired(true)
    ),
	async execute(interaction) {
    await interaction.deferReply();

    // Fetch information about Pokemon.
    let slot = interaction.options.getInteger('slot');
    let query1 = `
    SELECT
      ps.*, DATEDIFF(CURDATE(), ps.date) AS days_old,
      p.type1, p.type2, p.hp, p.attack, p.defense, p.spAttack, p.spDefense, p.speed,
      p.species, p.description, p.height, p.weight, p.egg1, p.egg2, p.frequency,
      p.evLevel, p.evIds
    FROM data.pokemon_status AS ps
    LEFT JOIN data.pokedex AS p
    ON ps.pokemonId = p.pokemonId
    WHERE userId = ? AND owned = 1
    ORDER BY epoch ASC;`
    let values1 = [interaction.user.id]
    let team = await async_query(query1, values1);
    if (team.length === 0) {
      interaction.reply("You don't have any Pokemon! Try catching one with `/pcatch`!");
      return;
    } else if (slot > team.length) {
      interaction.reply("You don't have a pokemon in that slot!")
      return;
    }
    let pokemon = team[slot-1];

    // Evolution logic. See if they evolved (one or more times)
    let ev_message = ''
      if (pokemon.evLevel != null && pokemon.days_old >= pokemon.evLevel) {
        ev_message = 'Your Pokemon evolved!';
        let ev_query = "SELECT name, pokemonId, evIds, evLevel FROM data.pokedex WHERE pokemonId = ?;"
        let ev_vals = [f.shuffle(pokemon.evIds.split('|'))[0]];
        let evo = await async_query(ev_query, ev_vals);
        let update_vals;
        if (evo[0].evLevel != null && pokemon.days_old >= evo[0].evLevel) {
          let ev2_query = "SELECT name, pokemonId, evIds, evLevel FROM data.pokedex WHERE pokemonId = ?;"
          let ev2_vals = [f.shuffle(evo[0].evIds.split('|'))[0]];
          let evo2 = await async_query(ev2_query, ev2_vals);
          update_vals = [evo2[0].pokemonId, evo2[0].name, interaction.user.id, pokemon.pokemonId, 1, pokemon.nick];
        } else {
          update_vals = [evo[0].pokemonId, evo[0].name, interaction.user.id, pokemon.pokemonId, 1, pokemon.nick];
        }
        let update_query = "UPDATE data.pokemon_status SET pokemonId = ?, name = ? WHERE userId = ? AND pokemonId = ? AND owned = ? AND nick = ?;";
        await async_query(update_query, update_vals);
      }
    if(ev_message.length > 0) {
      team = await async_query(query1, values1);
      pokemon = team[slot-1];
    };

    // Fetch evolution names from IDs
    let ev_str = '';
    if (pokemon.evIds != '') {
      ev_str += ` Your ${pokemon.name} evolves at level ${pokemon.evLevel} into `;
      let id_array = pokemon.evIds.split('|');
      let evo_names_query = 'SELECT name FROM data.pokedex WHERE pokemonId IN (?';
      let query_addition = ', ?'.repeat(id_array.length - 1);
      evo_names_query = evo_names_query + query_addition + ');'
      let evo_names = await async_query(evo_names_query, id_array);
      let evo_names_arr = []
      for (let i = 0; i < evo_names.length; i++) {
        evo_names_arr.push(evo_names[i].name);
      }
      ev_str += evo_names_arr.join(', ').replace(/, ([^,]*)$/, ' or $1')+"."
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
    let title = pokemon.nick + gender + ` - Lvl. ${pokemon.days_old}`;
    let description = `*Rarity: ${config.rarities[pokemon.frequency.toString()]}.* `
    description += pokemon.description + ev_str;
    let type2 = (pokemon.type2 != '') ? `, \`${pokemon.type2}\`` : '';
    let field4 = `\`${pokemon.type1}\`` + type2;
    let egg2 = (pokemon.egg2 != '') ? `, \`${pokemon.egg2}\`` : '';
    let field5 = `\`${pokemon.egg1}\`` + egg2;
    let field6 = `\`${pokemon.pokemonChar1}\`, \`${pokemon.pokemonChar2}\``;
    let color = config.types[pokemon.type1].color;
    let filename = pokemon.pokemonId.toString().padStart(3, '0') + '.png'
    let full_path = assets_dir + filename;
    let poke_pic = await getPokePic(full_path, filename, pokemon.shinyShift);

    // Generate stats block.
    let stats_block = "\n```";
    let stats = getStats(pokemon.epoch, pokemon.days_old, pokemon);
    for (var key of Object.keys(stats)) {
      stats_block += key.slice(0, 3).padStart(3, ' ') + ' ' + stats[key].val.toString().padStart(3, ' ');
      stats_block += ` ${stats[key].symb} |${'|'.repeat(Math.ceil(stats[key].val / 5))}\n`
    }
    stats_block = stats_block.slice(0,-1).toUpperCase() + '```'

    const embed = new MessageEmbed()
      .setTitle(title)
      .setColor(color)
      .setDescription(description + stats_block)
      .setImage('attachment://poke_pic.png')
      .setAuthor(author)
      .addFields(
        { name: 'Types', value: field4, inline: true },
        { name: 'Egg Groups', value: field5, inline: true },
        { name: 'Traits', value: field6, inline: true },
    	);
    interaction.editReply(
      {
        embeds: [embed],
        files: [poke_pic]
      }
    )

	}
};

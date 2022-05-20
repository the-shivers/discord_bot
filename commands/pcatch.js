"use strict";

// TO DO: fix genderless thing

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');
const Canvas = require('canvas');
const { async_query } = require('../db/scripts/db_funcs.js')
const assets_dir = './assets/pokemon/';
const config = require('../assets/pokemon/poke_info.json')
const f = require('../funcs.js');

var description = "Throw a ball to try capturing the Pokemon! Throwing a ";
description += "Pokeball rolls two 6-sided dice. If their sum matches or ";
description += "exceeds the Pokemon's capture difficulty, you'll catch it! ";
description += "Throwing a Great Ball takes the highest two of three dice, and ";
description += "throwing an Ultra Ball takes the highest two of four.\n\n";
description += "But remember, you have limited balls, and the pokmeon runs away if you take too long!"
const recharge = 60 * 60 * 2;

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

async function getShinyAttachment(full_path, filename, shinyShift) {
  const width = 100;
  const height = 100;
  const canvas = Canvas.createCanvas(width, height);
	const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage(full_path);
  ctx.drawImage(background, 0, 0, width, height);

  let img_data = ctx.getImageData(0, 0, width, height);
  let new_img_data = ctx.getImageData(0, 0, width, height);

  for (let i = 0; i < height * width; i++) {
    let matrix = getHueMatrix(shinyShift);
    let pos = i * 4;
    let new_rgb = applyHueMatrix(matrix, img_data.data[pos], img_data.data[pos+1], img_data.data[pos+2])
    new_img_data.data[pos] = new_rgb[0];
    new_img_data.data[pos+1] = new_rgb[1];
    new_img_data.data[pos+2] = new_rgb[2];
  }
  ctx.putImageData(new_img_data, 0, 0)
  let attach = new MessageAttachment(canvas.toBuffer(), filename);
  return attach;
}


function getCaptureDifficulty(frequency) {
  let catch_difficulty = Math.ceil(Math.random()*6) + Math.ceil(Math.random()*6);
  if (frequency >= 8) {
    catch_difficulty -= 1;
  }
  if (frequency <= 5) {
    catch_difficulty += 1;
  }
  if (frequency <= 3) {
    catch_difficulty += 1;
  }
  return Math.min(catch_difficulty, 11);
}

async function generate_embed(interaction, generation, curr_epoch_s) {

  let pokemon, captureDifficulty, traits, isShiny, shinyShift, gender, gender_symbol;
  let user_id = interaction.user.id;
  let date = interaction.createdAt.getFullYear() + '-'
    + (interaction.createdAt.getMonth()+1).toString().padStart(2, '0') + '-'
    + interaction.createdAt.getDate().toString().padStart(2, '0');

  // Find out if they captured toady
  let status_query = 'SELECT MAX(epoch) AS m_epoch FROM data.pokemon_status WHERE userId = ?;';
  let status_result = await async_query(status_query, [user_id, date]);
  let can_catch = (status_result.length === 0 || curr_epoch_s - status_result[0].m_epoch > recharge);

  // Get owned pokemon
  let owned_query = "SELECT nick FROM data.pokemon_status WHERE userId = ? AND owned = 1;";
  let owned_pokemon_result = await async_query(owned_query, [user_id]) // determines if we have too many pokemon
  let owned_pokemon = owned_pokemon_result.length;

  // Get ball quantities
  let pokeballs = 15;
  let greatballs = 3;
  let ultraballs = 1;
  let balls_query = "SELECT date, pokeballs, greatballs, ultraballs FROM data.pokemon_status WHERE userId = ? ORDER BY epoch DESC LIMIT 1;";
  let balls_result = await async_query (balls_query, [user_id]);
  if (balls_result.length > 0 && balls_result[0].date.getMonth() == interaction.createdAt.getMonth()) {
    pokeballs = balls_result[0].pokeballs;
    greatballs = balls_result[0].greatballs;
    ultraballs = balls_result[0].ultraballs;
  }

  // Get pokemon if catching is possible.
  if (owned_pokemon >= 6) {
  // if (1 == 2) {
    return [{content: "You already have 6 pokemon! Release one to catch again."},{}]
  } else if (!can_catch) {
  // } else if (1==2) {
    let remaining_seconds = recharge - (curr_epoch_s - status_result[0].m_epoch);
    let minutes = Math.floor(remaining_seconds / 60);
    let seconds = Math.floor(remaining_seconds - (minutes * 60));
    return [{content: `You have to wait ${minutes} minutes and ${seconds} seconds to catch another Pokemon!`},{}]
  } else {
    // First get the frequency and pokemon
    let frequency = f.shuffle(config.frequencies)[0];
    let pkmn_query = 'SELECT * FROM data.pokedex WHERE frequency = ? '
    let values = [parseInt(frequency)];
    if (generation != 'any') {
      pkmn_query += 'AND gen = ? '
      values.push(generation)
    }
    pkmn_query += 'ORDER BY RAND() LIMIT 1;'
    let pokemon_result = await async_query(pkmn_query, values);
    pokemon = pokemon_result[0];

    // Now we can update or insert after collecting capture difficulty/traits
    let update_query = '';
    captureDifficulty = await getCaptureDifficulty(frequency)
    traits = f.shuffle(config.characteristics).slice(0, 2);
    isShiny = Math.floor(Math.random() * 20) == 0;
    if (isShiny) {
      shinyShift = Math.floor((Math.random() * 66 + 16) * 3.6);
    } else {
      shinyShift = 0;
    }
    console.log('gender', pokemon.gender, 'pctmale', pokemon.pctMale);
    console.log(pokemon.pctMale == null)
    if (!(pokemon.pctMale == null)) {
      let rand = Math.random()
      gender = rand <= (pokemon.pctMale / 100) ? 'male' : 'female';
      gender_symbol = rand <= (pokemon.pctMale / 100) ? '\\♂' : '\\♀';
    } else {
      gender = 'unknown'
      gender_symbol = ''
    }

    update_query += 'INSERT INTO data.pokemon_status VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    await async_query(update_query, [user_id, date, captureDifficulty, pokemon.pokemonId, pokemon.name, traits[0], traits[1], isShiny, shinyShift, gender, 0, 0, pokemon.name + Math.ceil(Math.random() * 1000), pokeballs, greatballs, ultraballs, curr_epoch_s]);
  }

  // Get image
  let filename = pokemon.pokemonId.toString().padStart(3, '0') + '.png';
  let img_src = assets_dir + 'thumbnails/' + filename;
  let image;

  if (isShiny) {
    image = await getShinyAttachment(img_src, filename, shinyShift)
  } else {
    image = new MessageAttachment(img_src, filename);
  }

  // Embed assembly
  const embed = new MessageEmbed()
    .setTitle(`Wild ${pokemon.name}${gender_symbol} appeared!`)
    .setColor(config.types[pokemon.type1].color)
    .addField('Rarity', config.rarities[pokemon.frequency.toString()], true)
    .addField("Capture Difficulty", captureDifficulty.toString() + ' / 12', true)
    .addField("Characteristics", "`" + traits[0] + "`, `" + traits[1] + "`", true)
    .setDescription(description)
    .setThumbnail('attachment://' + filename);
  const buttons = new MessageActionRow();
  const poke = new MessageButton()
    .setCustomId(`p_catch_poke,${interaction.id}`)
    .setLabel(`Pokeball (${pokeballs})`)
    .setStyle('SUCCESS');
  if (pokeballs === 0) {poke.setDisabled(true)}
  const great = new MessageButton()
    .setCustomId(`p_catch_great,${interaction.id}`)
    .setLabel(`Great Ball (${greatballs})`)
    .setStyle('SUCCESS');
  if (greatballs === 0) {great.setDisabled(true)}
  const ultra = new MessageButton()
    .setCustomId(`p_catch_ultra,${interaction.id}`)
    .setLabel(`Ultra Ball (${ultraballs})`)
    .setStyle('SUCCESS');
  if (ultraballs === 0) {ultra.setDisabled(true)}
  const decline = new MessageButton()
    .setCustomId(`p_catch_decline,${interaction.id}`)
    .setLabel("I'm afraid...")
    .setStyle('DANGER');
  buttons.addComponents(poke, great, ultra, decline);

  return ([{
    embeds: [embed],
    files: [image],
    components: [buttons],
    ephemeral: false,
    fetchReply: true
  }, {
    pokeballs: pokeballs,
    greatballs: greatballs,
    ultraballs: ultraballs,
    pokemon: pokemon,
    captureDifficulty: captureDifficulty,
    traits: traits,
    isShiny: isShiny,
    shinyShift: shinyShift,
    owned_pokemon: owned_pokemon,
    date: date
  }])

}


module.exports = {
	type: "private",
  cat: "games",
  desc: "Catch a pokemon!",
	data: new SlashCommandBuilder()
		.setName('pcatch')
		.setDescription('Catch a pokemon!')
    .addStringOption(option => option
      .setName('generation')
      .setDescription('Select gen to catch pokemon from!')
      .addChoices({name:'Gen I', value:'I'}).addChoices({name:'Gen II', value:'II'})
      .addChoices({name:'Gen III', value:'III'}).addChoices({name:'Gen IV', value:'IV'})
      .addChoices({name:'Gen V', value:'V'}).addChoices({name:'Gen VI', value:'VI'})
      .addChoices({name:'Gen VII', value:'VII'}).addChoices({name:'Any Gen', value:'any'})
    ),
	async execute(interaction) {
    let curr_epoch_s = Math.floor(new Date().getTime() / 1000);
    let generation = 'any';
    if (!(interaction.options.getString('generation') == null)) {
      generation = interaction.options.getString('generation');
    }
    let response = await generate_embed(interaction, generation, curr_epoch_s);
    let reply_content = response[0];
    let catch_data = response[1];

    if (!("content" in reply_content)) {
      interaction.reply(reply_content);
      let filter = button => button.customId.includes(interaction.id);
      let collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 120 * 1000 });
      let responded = false;
      let new_row = new MessageActionRow();
      let row = reply_content.components[0].components;
      for (let i = 0; i < row.length; i++) {
        row[i].setDisabled(true);
        new_row.addComponents(row[i]);
      }

      collector.on('collect', i => {
        if (i.user.id === interaction.user.id) {

          // Catch logic
          let content = 'Your roll: ';
          let dice = 2;
          let roll_arr = [];
          if (i.customId.split(',')[0] == 'p_catch_decline') {
            content = 'You ran away from the wild Pokemon!'
          } else if (i.customId.split(',')[0] == 'p_catch_poke') {
            catch_data.pokeballs -= 1;
          } else if (i.customId.split(',')[0] == 'p_catch_great') {
            catch_data.greatballs -= 1;
            dice += 1;
          } else if (i.customId.split(',')[0] == 'p_catch_ultra') {
            catch_data.ultraballs -= 1;
            dice += 2;
          }
          if (i.customId.split(',')[0] != 'p_catch_decline') {
            for (let i = 0; i < dice; i++) {
              roll_arr.push(Math.ceil(Math.random() * 6));
              content += '`' + roll_arr[i] + '`, '
            }
            content += "giving you a total of `"
            let final_query;
            roll_arr.sort(function(a, b){return b-a});
            let rolls = roll_arr.slice(0, 2);
            let total_rolls = rolls[0] + rolls[1];
            content += total_rolls + '`. '
            if (total_rolls >= catch_data.captureDifficulty) {
              content += `You caught the wild ${catch_data.pokemon.name}!`
              final_query = "UPDATE data.pokemon_status SET owned = ?, slot = ? WHERE userId = ? AND epoch = ? AND name = ?;";
              async_query(final_query, [1, catch_data.owned_pokemon + 1, interaction.user.id, curr_epoch_s, catch_data.pokemon.name]);
            } else {
              content += `Oh no! The wild ${catch_data.pokemon.name} escaped!`
            }
            final_query = "UPDATE data.pokemon_status SET pokeballs = ?, greatballs = ?, ultraballs = ? WHERE userId = ? AND epoch = ?;";
            async_query(final_query, [catch_data.pokeballs, catch_data.greatballs, catch_data.ultraballs, interaction.user.id, curr_epoch_s]);
          }
          i.reply({ content: content, ephemeral: false });
          interaction.editReply({ components: [new_row] })
          responded = true;
        } else {
          i.reply({ content: "That's not your pokemon to catch!", ephemeral: false });
        }
      });

      collector.on('end', collected => {
        if (!responded) {
          interaction.editReply({ components: [new_row] })
          interaction.channel.send("The pokemon got away!")
        }
      });

    } else {
      interaction.reply(reply_content);
    }
	}
};

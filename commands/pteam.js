"use strict";

// Constants
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');
const { async_query } = require('../db/scripts/db_funcs.js')
const assets_dir = './assets/pokemon/thumbnails/';
const f = require('../funcs.js');

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

async function getTeamPic(full_path_arr, filename_arr, shinyShift_arr) {
  const canvas = Canvas.createCanvas(600, 100);
	const ctx = canvas.getContext('2d');
  for (let i = 0; i < full_path_arr.length; i++) {
    let img = await Canvas.loadImage(full_path_arr[i]);
    ctx.drawImage(img, i * 100, 0, 100, 100);
    if (shinyShift_arr[i] != 0) {
      let img_data = ctx.getImageData(i * 100, 0, 100, 100);
      let new_img_data = ctx.getImageData(i * 100, 0, 100, 100);
      for (let j = 0; j < 100 * 100; j++) {
        let matrix = getHueMatrix(shinyShift_arr[i])
        let pos = j * 4;
        let new_rgb = applyHueMatrix(matrix, img_data.data[pos], img_data.data[pos+1], img_data.data[pos+2]);
        new_img_data.data[pos] = new_rgb[0];
        new_img_data.data[pos+1] = new_rgb[1];
        new_img_data.data[pos+2] = new_rgb[2];
      }
      ctx.putImageData(new_img_data, i * 100, 0)
    }
  }
  let attach = new MessageAttachment(canvas.toBuffer(), 'team_pic.png');
  return attach
}


module.exports = {
  type: "private",
  cat: "games",
  desc: "See your Pokemon team!",
	data: new SlashCommandBuilder()
		.setName('pteam')
		.setDescription('Show your Pokemon team!')
    .addUserOption(option => option
      .setName('target')
      .setDescription('Pokemon team to look at (defaults to your own)')
      .setRequired(false)
    ),
	async execute(interaction) {
    let user = interaction.options.getUser('target') ?? interaction.user;
    let query = "SELECT ps.*, DATEDIFF(CURDATE(), date) AS days_old, p.evLevel, p.evIds FROM data.pokemon_status AS ps LEFT JOIN data.pokedex AS p ON ps.pokemonId = p.pokemonId WHERE userId = ? AND owned = 1 ORDER BY epoch ASC;"
    let values = [user.id]
    let team = await async_query(query, values);
    if (team.length === 0) {
      interaction.reply("You don't have any Pokemon! Try catching one with `/pcatch`!");
    } else {

      // Evolution logic.
      let ev_message = '';
      for (let i = 0; i < team.length; i++) {
        if (team[i].evLevel != null && team[i].days_old >= team[i].evLevel) {
          ev_message = 'Looks like one (or more!) of the pokemon evolved!\n\n';
          let ev_query = "SELECT name, pokemonId FROM data.pokedex WHERE pokemonId = ?;"
          let ev_vals = [f.shuffle(team[i].evIds.split('|'))[0]];
          let evo = await async_query(ev_query, ev_vals);
          let update_query = "UPDATE data.pokemon_status SET pokemonId = ?, name = ? WHERE userId = ? AND pokemonId = ? AND owned = ? AND nick = ?;";
          let update_vals = [evo[0].pokemonId, evo[0].name, user.id, team[i].pokemonId, 1, team[i].nick];
          await async_query(update_query, update_vals);
        }
      }
      if(ev_message.length > 0) {
        team = await async_query(query, values);
      };

      let full_path_arr = [];
      let filename_arr = [];
      let shinyShift_arr = [];
      let filename;
      let desc = '';
      let gender_symbol = '';
      for (let i = 0; i < team.length; i++) {
        let pokemon = team[i];
        filename = pokemon.pokemonId.toString().padStart(3, '0') + '.png'
        full_path_arr.push(assets_dir + filename);
        filename_arr.push(filename);
        shinyShift_arr.push(pokemon.shinyShift);
        if (pokemon.gender == 'male') {
          gender_symbol = '\♂';
        } else if (pokemon.gender == 'female') {
          gender_symbol = '\♀';
        }
        desc += (i + 1) + '. ' + pokemon.nick + ' | ' + pokemon.name + `\\${gender_symbol}`;
        desc += " | Lvl. " + (pokemon.days_old + 1);
        desc += " | `" + pokemon.pokemonChar1 + "`, `" + pokemon.pokemonChar2 + "`\n"
      }
      let team_pic = await getTeamPic(full_path_arr, filename_arr, shinyShift_arr);
      const embed = new MessageEmbed()
        .setTitle(`${user.username}'s Pokemon team!`)
        .setColor("#c03028")
        .setDescription(ev_message + desc)
        .setImage('attachment://team_pic.png');
      interaction.reply({ embeds: [embed], files: [team_pic] })
    }
	}
};

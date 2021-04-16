const fs = require('fs');
const f = require('../../funcs.js');
const bing = require('../bing/bing.js');
const Discord = require('discord.js');
const sona_vars = JSON.parse(
  fs.readFileSync('scripts/sona/sona.json', 'utf8')
);

async function sona(msg, content) {
  // Collect random info string from each JSON element.
  let sona_info = {};
  Object.keys(sona_vars).forEach(function(key) {
    var value = sona_vars[key];
    sona_info[key] = value[Math.floor(Math.random() * value.length)];
  })

  let gender = sona_info.gender;
  let species = sona_info.species;
  let color_arr = f.shuffle(sona_vars.color).slice(0, sona_info.pattern.colors)
  let color_str = sona_info.pattern.name + " " + color_arr.join(" and ");
  let box_color = color_arr[0]
  color_str = color_str.toLowerCase().replace(/_/g, " ");
  let weight = parseInt(sona_info.height_ft, 10)
    * Math.round(Math.random() * 50 + 3);
  let acts = f.shuffle(sona_vars.activity).slice(0,4);
  let sound_str = "Your " + species.sound + " " + sona_info.sound;
  let stats_arr = f.shuffle(sona_vars.stats).slice(0,3)

  let sona = `You're a ${sona_info.sexuality} ${gender.name} ${sona_info.mode} `;
  sona += `${sona_info.species.name} named ${sona_info.first_name} `;
  sona += `${sona_info.ln_first}${sona_info.ln_second} with${color_str} `;
  sona += `${species.coat}. You are ${sona_info.height_ft}'${sona_info.height_in} `;
  sona += `tall and weigh ${weight} lbs. ${sound_str} `;
  sona += `and you smell ${sona_info.smell}. `;
  sona += `You ${sona_info.like} ${acts[3]}, ${acts[0]}, `;
  sona += `and ${acts[1]} but ${sona_info.dislike} ${acts[2]}.`;

  query = gender.name + " " + " " + color_arr[0] + " "
  + sona_info.mode
  + ' "' + species.name + '" '
  ;

  let url = await bing.getBingUrl(query);
  const template = new Discord.MessageEmbed()
    .setColor(color_arr[0])
    .setTitle("Your New Fursona!")
    .setDescription(sona)
    .setImage(url)
    .addField(stats_arr[0].toUpperCase(), "`SCORE: " + f.rollDie(100) + "/100`", true)
    .addField(stats_arr[1].toUpperCase(), "`SCORE: " + f.rollDie(100) + "/100`", true)
    .addField(stats_arr[2].toUpperCase(), "`SCORE: " + f.rollDie(100) + "/100`", true);
  msg.reply(template);
}

module.exports = { sona };

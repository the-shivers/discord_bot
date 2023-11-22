const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const Discord = require('discord.js');
const api_options = require("../api_keys.json").googleSearch
// const f = require('../funcs.js');
const assets_dir = '../assets/rpg/';
var bg_vars = require(assets_dir + 'bg.json');
var race_vars = require(assets_dir + 'race.json');

module.exports = {
  type: "public",
  cat: "utility",
  desc: "Generate a RPG character.",
	data: new SlashCommandBuilder()
		.setName('rpg')
		.setDescription('Generate an RPG character'),
	async execute(interaction) {

    // Useful funcs
    function get_rand_element(arr) {
        if (arr.length === 0) { 
          return null; 
        }
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
      }

    // Gender
    let gender = get_rand_element([
        'male', 'male', 'male', 'male', 'male', 
        'female', 'female', 
        'nonbinary'
    ]);

    // Class
    let pc_class = get_rand_element([
        'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 
        'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
    ])

    // Race info
    const race_keys = Object.keys(race_vars);
    const race_index = Math.floor(Math.random() * race_keys.length);
    const selected_race = race_keys[race_index];
    const race_details = race_vars[selected_race];

    // Background info
    const bg_keys = Object.keys(bg_vars);
    const bg_index = Math.floor(Math.random() * bg_keys.length);
    const selected_bg = bg_keys[bg_index];
    const bg_details = bg_vars[selected_bg];
    const bg_subtype = get_rand_element(bg_details.types);
    function determineArticle(word) {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        return vowels.includes(word[0].toLowerCase()) ? 'an' : 'a';
    }
    function formatSentence(bg_details, bg_subtype) {
        const nameWithArticle = `${determineArticle(bg_details.name)} ${bg_details.name.toLowerCase()}`;
        const subtypeWithArticle = `${determineArticle(bg_subtype)} ${bg_subtype.toLowerCase()}`;
        return ` You have ${nameWithArticle} background, specifically ${subtypeWithArticle}.`;
    }
    let bg_sentence = formatSentence(bg_details, bg_subtype);

    // First Name
    let first_name;
    if (gender == 'male') {
        first_name = get_rand_element(
            race_details.names.first.male.concat(race_details.names.first.other)
        )
    } else if (gender == 'female') {
        first_name = get_rand_element(
            race_details.names.first.female.concat(race_details.names.first.other)
        )
    } else {
        first_name = get_rand_element(race_details.names.first.other)
    }

    // Last Name
    let last_name = race_details.names.last.length > 0 
        ? get_rand_element(race_details.names.last)
        : null;

    // Full Name
    let full_name = '';
    if (first_name) {
        full_name += first_name;
    }
    if (last_name) {
        if (full_name) full_name += ' ';
        full_name += last_name;  
    }

    // Height, Weight
    function rollDice(diceString) {
        // Parses a dice string like "2d6" and returns random roll
        const [numDice, numSides] = diceString.split('d'); 
        let total = 0;
        for(let i = 0; i < numDice; i++) {
          total += Math.floor(Math.random() * numSides) + 1;
        }
        return total; 
    }
    let height_roll = rollDice(race_details.height_modifier);
    let height = race_details.base_height + height_roll;
    let weight_roll = rollDice(race_details.weight_modifier);
    let weight = race_details.base_weight + (height_roll * weight_roll);

    // Age
    function biasedRandomInRange(range) {
        const [min, max] = range;
        const midpoint = min + (max - min) / 2;
        let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        if (randomNumber > midpoint) {
            randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return randomNumber;
    }
    let age = biasedRandomInRange(race_details.age);
    const feet = Math.floor(height / 12);
    const inches = height % 12;
    let hwa_str = ` You are ${feet}'${inches}", ${weight} lbs, and ${age} years old.`;

    // Stats generation
    function generateRandomStats(raceDetails) {
        const stats = {
            str: [Math.floor(Math.random() * 20) + 1, raceDetails.ability_scores['str'] || 0],
            dex: [Math.floor(Math.random() * 20) + 1, raceDetails.ability_scores['dex'] || 0],
            con: [Math.floor(Math.random() * 20) + 1, raceDetails.ability_scores['con'] || 0],
            int: [Math.floor(Math.random() * 20) + 1, raceDetails.ability_scores['int'] || 0],
            wis: [Math.floor(Math.random() * 20) + 1, raceDetails.ability_scores['wis'] || 0],
            cha: [Math.floor(Math.random() * 20) + 1, raceDetails.ability_scores['cha'] || 0]
        };
        return stats;
    }
    function formatStatsForDiscord(stats) {
        let formattedStats = '\n\n```\n';
        for (const [key, [baseValue, bonus]] of Object.entries(stats)) {
            const totalValue = baseValue + bonus;
            formattedStats += `${key.toUpperCase()} ${'■'.repeat(totalValue)} (${baseValue}+${bonus})\n`;
        }
        formattedStats += '```';
        return formattedStats;
    }
    const stats = generateRandomStats();
    let stat_str = formatStatsForDiscord(stats, race_details);
    
    

    // Full character description
    let full_desc = `You are ${full_name}, a ${gender} ${race_details.name.toLowerCase()} ${pc_class}. `;
    for (let key in race_details.appearance_options) {
        full_desc += get_rand_element(race_details.appearance_options[key]);
    }
    full_desc += hwa_str;
    full_desc += bg_sentence;
    full_desc += stat_str;

    // You are a [gender] [race] [class] with a(n) [background] background
    // description
    // You are [height] and [weight]. 


    
    // let pc_info = {};
    // Object.keys(sona_vars).forEach(function(key) {
    //   var value = sona_vars[key];
    //   sona_info[key] = value[Math.floor(Math.random() * value.length)];
    // })

    // let gender = sona_info.gender;
    // let species = sona_info.species;
    // let color_arr = f.shuffle(sona_vars.color).slice(0, sona_info.pattern.colors)
    // let color_str = sona_info.pattern.name + " " + color_arr.join(" and ");
    // let box_color = color_arr[0]
    // color_str = color_str.toLowerCase().replace(/_/g, " ");
    // let weight = parseInt(sona_info.height_ft, 10)
    //   * Math.round(Math.random() * 50 + 3);
    // let acts = f.shuffle(sona_vars.activity).slice(0,4);
    // let sound_str = "Your " + species.sound + " " + sona_info.sound;
    // let stats_arr = f.shuffle(sona_vars.stats).slice(0,3)

    // let sona = `You're a ${sona_info.sexuality} ${gender.name} ${sona_info.mode} `;
    // sona += `${sona_info.species.name} named ${sona_info.first_name} `;
    // sona += `${sona_info.ln_first}${sona_info.ln_second} with${color_str} `;
    // sona += `${species.coat}. You are ${sona_info.height_ft}'${sona_info.height_in} `;
    // sona += `tall and weigh ${weight} lbs. ${sound_str} `;
    // sona += `and you smell ${sona_info.smell}. `;
    // sona += `You ${sona_info.like} ${acts[3]}, ${acts[0]}, `;
    // sona += `and ${acts[1]} but ${sona_info.dislike} ${acts[2]}.`;

    // query = gender.name + " " + " " + color_arr[0] + " "
    // + sona_info.mode
    // + ' "' + species.name + '" furry' ;
    // query = query.split('_').join(' ');

    let query = `${gender} ${race_details.name.toLowerCase()} ${pc_class}`

    let full_url = (
      api_options.url + "?cx=" + api_options.cx + "&key=" + api_options.key
      + "&q=" + query + "&num=1&searchType=image"
    );
    if (interaction.options.getBoolean('sfw') === true) {
      full_url += "&safe=active";
    } else {
      full_url += "&safe=off";
    }

    let img_url;
    const template = new Discord.MessageEmbed()
    //   .setColor(color_arr[0])
      .setTitle("Your RPG Character")
      .setDescription(full_desc)
    //   .addField(stats_arr[0].toUpperCase(), "`SCORE: " + f.rollDie(100) + "/100`", true)
    //   .addField(stats_arr[1].toUpperCase(), "`SCORE: " + f.rollDie(100) + "/100`", true)
    //   .addField(stats_arr[2].toUpperCase(), "`SCORE: " + f.rollDie(100) + "/100`", true)
      ;

    axios.get(full_url)
      .then(response => {
        if (response.data.items.length > 0) {
          img_url = response.data.items[0].link;
        } else {
          img_url = 'https://miro.medium.com/max/700/1*lmjQkoQSn-TumBMfGxQvgQ.png';
        }
        template.setImage(img_url);
        interaction.reply({ embeds: [template] });
      })
      .catch(error => {
        console.log('error was ', error)
        interaction.reply("Google messed it up!")
      });

  }
}

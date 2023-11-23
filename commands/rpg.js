const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const Discord = require('discord.js');
const api_options = require("../api_keys.json").googleSearch
// const f = require('../funcs.js');
const assets_dir = '../assets/rpg/';
var bg_vars = require(assets_dir + 'bg.json');
var race_vars = require(assets_dir + 'race.json');
var stat_descriptions = require(assets_dir + 'stats.json');

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

    // Alignment
    let alignment = get_rand_element([
        'lawful good', 'neutral good', 'chaotic good',
        'lawful neutral', 'true neutral', 'chaotic neutral',
        'lawful evil', 'neutral evil', 'chaotic evil'
    ]);
    let align_desc = ` You are ${alignment}.`;

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
        let allScores = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        let fixedScores = {};
        let flexibleIncreases = 0;
        for (let score in raceDetails.ability_scores) {
            if (score.startsWith("other")) {
                flexibleIncreases += raceDetails.ability_scores[score];
            } else {
                fixedScores[score] = raceDetails.ability_scores[score];
            }
        }
        allScores = allScores.filter(score => !(score in fixedScores));
        while (flexibleIncreases > 0 && allScores.length > 0) {
            const randomIndex = Math.floor(Math.random() * allScores.length);
            const selectedScore = allScores[randomIndex];
            fixedScores[selectedScore] = (fixedScores[selectedScore] || 0) + 1;
            allScores.splice(randomIndex, 1);
            flexibleIncreases--;
        }
        const stats = {};
        for (let score of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
            stats[score] = [Math.floor(Math.random() * 20) + 1, fixedScores[score] || 0];
        }
        return stats;
    }
    function formatStatsForDiscord(stats) {
        let formattedStats = '\n```\n';
        for (const [key, [baseValue, bonus]] of Object.entries(stats)) {
            const totalValue = baseValue + bonus;
            const displayValue = bonus === 0 ? `${baseValue}` : `${baseValue}+${bonus}`;
            formattedStats += `${key.toUpperCase()} ${'◼'.repeat(totalValue)} ${displayValue}\n`;
        }
        formattedStats += '```';
        return formattedStats;
    }
    const stats = generateRandomStats(race_details);
    let stat_str = formatStatsForDiscord(stats);

    // Analysis
    function analyzeStats(stats) {
        let sum = 0;
        let lowestStat = { name: '', value: Infinity };
        let highestStat = { name: '', value: -Infinity };
        for (const [key, [baseValue, bonus]] of Object.entries(stats)) {
            const totalValue = baseValue + bonus;
            sum += totalValue;
            if (totalValue < lowestStat.value) {
                lowestStat = { name: key, value: totalValue };
            }
            if (totalValue > highestStat.value) {
                highestStat = { name: key, value: totalValue };
            }
        }
        return {sum: sum, lowestStat: lowestStat, highestStat: highestStat};
    }
    analysis = analyzeStats(stats)
    function describeStats(analysis) {
        function clipStatValue(value) {
            return Math.min(Math.max(value, 1), 20);
        }
        const highestStatValue = clipStatValue(analysis.highestStat.value);
        const lowestStatValue = clipStatValue(analysis.lowestStat.value);
        const highestStatDesc = stat_descriptions[analysis.highestStat.name][highestStatValue];
        const lowestStatDesc = stat_descriptions[analysis.lowestStat.name][lowestStatValue];
        return {
            highestStat: `\nYour highest stat is ***${analysis.highestStat.name.toUpperCase()} (${analysis.highestStat.value})***: ${highestStatDesc}`,
            lowestStat: `\nYour lowest stat is ***${analysis.lowestStat.name.toUpperCase()} (${analysis.lowestStat.value})***: ${lowestStatDesc}`
        };
    }
    const descriptions = describeStats(analysis);
    let stat1 = descriptions.highestStat;
    let stat2 = descriptions.lowestStat;
    
    function categorizeSum(sum) {
        if (sum <= 20) return "kys-tier";
        if (sum <= 30) return "Abysmal";
        if (sum <= 40) return "Depressing";
        if (sum <= 50) return "Disappointing";
        if (sum <= 60) return "Below Average";
        if (sum <= 70) return "Average";
        if (sum <= 80) return "Good";
        if (sum <= 90) return "Excellent";
        if (sum <= 100) return "Exceptional";
        return "God-like";
    }
    let sum_desc = `\nYour stat total is ***${analysis.sum}*** which is ${categorizeSum(analysis.sum)}.`
    
    // Full character description
    let full_desc = `You are ${full_name}, a ${gender} ${race_details.name.toLowerCase()} ${pc_class}. `;
    for (let key in race_details.appearance_options) {
        full_desc += get_rand_element(race_details.appearance_options[key]);
    }
    full_desc += hwa_str;
    full_desc += bg_sentence;
    full_desc += align_desc;
    full_desc += stat_str;
    full_desc += sum_desc;
    full_desc += stat1;
    full_desc += stat2;
    
    // Get image
    let query = `${gender} ${race_details.name.toLowerCase()} ${pc_class} ${bg_details.name}`
    let full_url = (
      api_options.url + "?cx=" + api_options.cx + "&key=" + api_options.key
      + "&q=" + query + "&num=1&searchType=image"
    );
    if (interaction.options.getBoolean('sfw') === true) {
      full_url += "&safe=active";
    } else {
      full_url += "&safe=off";
    }

    // Template response
    let img_url;
    const template = new Discord.MessageEmbed()
      .setColor('blue')
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

"use strict";

// Imports
const seedrandom = require('seedrandom')
const Discord = require('discord.js');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
var animal_stats = require('./animal_stats.json');
let fill = '\u200b';
const rare_pet_prob = 1/8; // Usually 1/8
const rare_variant_prob = 1/3; // Usually 1/3

// console.log("keys are", Object.keys(animal_stats));
// var rng = seedrandom('hello.');
// console.log(rng());                  // Always 0.9282578795792454

function generatePets(msg, user_specific=false) {
  let pet_array = [];
  let d = new Date();
  let date_int = Math.floor(d/8.64e7) - 18741;
  let user_int = 0;
  if (user_specific) {
    user_int = 2;
  }
  let keys = Object.keys(animal_stats)
  pet_array.push(keys[(date_int + user_int) % 5])
  pet_array.push(keys[(date_int + user_int + 1) % 5])
  pet_array.push(keys[(date_int + user_int + 2) % 5])
  return pet_array;
}

function getVariant(msg, pet_str, user_specific=false) {
  // Returns variant object randomly
  let pet_array = [];
  let d = new Date();
  let date_int = Math.floor(d/8.64e7) - 18741;
  if (user_specific) {
    date_int += msg.author.id
  }
  let rng = seedrandom(date_int + pet_str);
  let specified_rarity = "uncommon";
  if (rng() < rare_variant_prob) {
    specified_rarity = "rare";
  }
  console.log("pet_str", pet_str, "rng", rng(), "rarity", specified_rarity)
  let variants_arr = [];
  for (const key of Object.keys(animal_stats[pet_str].variants)) {
    if (animal_stats[pet_str].variants[key].rarity === specified_rarity) {
      variants_arr.push(animal_stats[pet_str].variants[key])
    }
  }
  rng = seedrandom(date_int + pet_str + 1);
  return variants_arr[Math.floor(rng() * variants_arr.length)];
}

function getPetFieldContent(msg, pet_str, index=0, user_specific=false) {
  let d = new Date();
  let date_int = Math.floor(d/8.64e7) - 18741;
  if (user_specific) {
    date_int += parseInt((msg.author.id).slice(4))
  }
  console.log("Pet string in getPetFieldCOntent is ", pet_str)
  let emoji = animal_stats[pet_str].emoji;
  let desc = animal_stats[pet_str].description;
  let name = animal_stats[pet_str].str;
  let price = animal_stats[pet_str].base_price;
  let animal_type = name;
  let rarity = "common"
  let rng = seedrandom(date_int + pet_str + index)
  if (rng() < rare_pet_prob) {
    let variant = getVariant(msg, pet_str);
    name = variant.str;
    emoji = variant.emoji
    rarity = variant.rarity;
    //beverage = (age >= 21) ? "Beer" : "Juice";
    price = (rarity === 'uncommon') ? price * 2 : price * 3;
  }
  name = name.split('_').join(' ');
  name = name[0].toUpperCase() + name.slice(1);
  rarity = rarity[0].toUpperCase() + rarity.slice(1);
  animal_type = animal_type[0].toUpperCase() + animal_type.slice(1);
  let first_part = emoji + " " + name;
  let second_part = "Rarity: `" + rarity + "\n" + "`";
  second_part += "Animal Type: `" + animal_type + "\n" + "`";
  second_part += "Description: `" + desc + "\n" + "`";
  second_part += "Price: `₣" + price.toFixed(2) + "`";
  return [first_part, second_part];
}


function f_petshop(msg, content) {
  if (f_record[msg.author.id]["Level"] < 7) {
    msg.channel.send("You need to be level 7 to get a pet! Duh!")
    return;
  }
  let pet_array = generatePets(msg);
  let fields_1 = getPetFieldContent(msg, pet_array[0]);
  let fields_2 = getPetFieldContent(msg, pet_array[1], 1);
  let fields_3 = getPetFieldContent(msg, pet_array[2], 2);
  let user_pet_array = generatePets(msg, true);
  let fields_4 = getPetFieldContent(msg, user_pet_array[0], 0, true);
  let fields_5 = getPetFieldContent(msg, user_pet_array[1], 1, true);
  let fields_6 = getPetFieldContent(msg, user_pet_array[2], 2, true);
  let desc = "The first three pets are available to everyone level 7 or higher.\n"
  desc += "The last three pets are only available to you.\n\n"
  desc += "Use `!f petshop buy <1-6>` to purchase the corresponding pet.\n" + fill
  const attachment = new Discord.MessageAttachment('./scripts/fruitymon/assets/chicken.gif', 'chicken.gif');
  const template = new Discord.MessageEmbed()
    .setColor('#AAFF22')
    .setTitle(" 🐮 🐔 🐷 🐶  Pet Store - New Animals Daily!  🐶 🐷 🐔 🐮 ")
    .setDescription(desc)
    .attachFiles(attachment)
    .setThumbnail('attachment://chicken.gif')
    .addField('1. ' + fields_1[0], fields_1[1], true)
    .addField('2. ' + fields_2[0], fields_2[1], true)
    .addField('3. ' + fields_3[0], fields_3[1], true)
    .addField('4. ' + fields_4[0], fields_4[1], true)
    .addField('5. ' + fields_5[0], fields_5[1], true)
    .addField('6. ' + fields_6[0], fields_6[1], true)
  msg.channel.send(template)
}

function f_pettiers(msg, content) {
  let description = "The different colored circles indicate a pet's rarity:\n\n"
  description += "⚪ is common.\n🔵 is uncommon.\n🟣 is rare."
  const attachment = new Discord.MessageAttachment('./scripts/fruitymon/assets/sheep.gif', 'sheep.gif');
  const template = new Discord.MessageEmbed()
    .setColor('#AA44AA')
    .setTitle("Pet Tiers")
    .setDescription(description)
    .attachFiles(attachment)
    .setThumbnail('attachment://sheep.gif');
  let i = 0;
  for (const key of Object.keys(animal_stats)) {
    let title = (i + 1) + ". " + animal_stats[key].proper;
    let descs_str = "⚪" + animal_stats[key].emoji + " " + animal_stats[key].proper + "\n"
    for (const variant of Object.keys(animal_stats[key].variants)) {
      let this_var = animal_stats[key].variants[variant];
      descs_str += this_var.r_emoji + " " + this_var.emoji + " " + this_var.proper + "\n"
    }
    template.addField(title, descs_str, true)
    i++;
  }
  template.addField("6. Exotics", "???", true)
  msg.channel.send(template)
}

function f_petshop_buy(msg, content) {
  let split = content.split(' ')

}



module.exports = {f_petshop, f_petshop_buy, f_pettiers};


// Exotics: dragon (eggs, scales), t-rex, (eggs, scales), unicorn (milk, sparkles)

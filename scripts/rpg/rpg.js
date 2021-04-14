"use strict";

// Define Constants and key Variables
const fs = require('fs');
const f = require('../../funcs.js');
const rpg_vars = JSON.parse(
  fs.readFileSync('scripts/rpg/rpg_vars.json', 'utf8')
);
const rpg_bgs =  JSON.parse(
  fs.readFileSync('scripts/rpg/rpg_bgs.json', 'utf8')
);

function rpg(msg, content) {
  // Returns a complex string with information of RPG character.

  // Collect random info string from each JSON element.
  let rpg_char_info = {};
  Object.keys(rpg_vars).forEach(function(key) {
    var value = rpg_vars[key];
    rpg_char_info[key] = value[Math.floor(Math.random() * value.length)];
  })

  // Collect random info string from background.
  let bg_info = {};
  let your_bg = rpg_bgs[rpg_char_info.bg_keys]
  Object.keys(your_bg).forEach(function(key) {
    var value = your_bg[key];
    bg_info[key] = value[Math.floor(Math.random() * value.length)]
  })
  // Correct name, since it's a string instead of a list...
  bg_info.name = your_bg.name;

  // Generate stats
  let stat_arr = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  let stat_msg = "";
  let total = 0;
  for (var i = 0; i < stat_arr.length; i++) {
    let roll = f.rollDie(20);
    stat_msg += "`" + stat_arr[i] + ": " + roll + "`\n"
    total += roll;
  }

  // Describe stats
  let stat = "";
  if (total > 90) {stat = 'Beastly!!!';}
  else if (total > 85) {stat = 'Extremely strong!!';}
  else if (total > 80) {stat = 'Very strong!';}
  else if (total > 75) {stat = 'Strong!';}
  else if (total > 70) {stat = 'Fairly strong.';}
  else if (total > 65) {stat = 'Somewhat strong.';}
  else if (total > 60) {stat = 'Average.';}
  else if (total > 55) {stat = 'Weak.';}
  else if (total > 50) {stat = 'Very weak.';}
  else if (total > 45) {stat = 'Frail.';}
  else if (total > 40) {stat = 'Extremely fragile.';}
  else {stat = 'Shamefully, pathetically weak.';}

  // Create and send message
  let send_msg = "You are a " + rpg_char_info.modifiers + ' '
  + rpg_char_info.genders + ' ' + rpg_char_info.races + " "
  + rpg_char_info.classes + " named " + rpg_char_info.first_names + " "
  + rpg_char_info.ln_first + rpg_char_info.ln_second + ". "
  send_msg += "Standing at " + rpg_char_info.height_ft + "'"
  + rpg_char_info.height_in + ' and clad in ' + rpg_char_info.armor
  + ', you wield ' +  rpg_char_info.weapon_first + ' and '
  + rpg_char_info.weapon_second + '. You are ' + rpg_char_info.alignment
  + ' and speak ' + rpg_char_info.basic_languages + ', '
  + rpg_char_info.exotic_languages + ', and '
  + rpg_char_info.ultra_exotic_languages +'.\n\n'
  send_msg += stat_msg + 'Overall stats: **' + stat + '** (' + total.toString()
  + ')\n\n'
  send_msg += "Background: " + bg_info.name + " (Specialization: "
  + bg_info.types  + "). " + bg_info.personalities + " " + bg_info.ideals
  + " " + bg_info.bonds + " " + bg_info.flaws
  msg.reply(send_msg);
}

module.exports = { rpg };

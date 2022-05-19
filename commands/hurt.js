"use strict";

//Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const { async_query } = require('../db/scripts/db_funcs.js');

//Constants
const resurrection = 60 * 60 * 24;
const cooldown = 15;
const health = 20;
const std_n_die = 2;
const std_d = 6;
const rsk_n_die = 1;
const rsk_d = 25;
const weakness_cutoff = 5;
const kmk_n_die = 1;
const kmk_target_d = 50;
const kmk_user_d = 40;
const hl_n_die = 4;
const hl_d = 4;
const max_health = 50;

// Key funcs
function targetIsAlive(target_data) {
  let curr_epoch_s = new Date().getTime() / 1000;
  if (Object.keys(target_data).length < 3) {
    return {status: true, reason_str: ''};
  } else if (target_data.isAlive == 1) {
    return {status: true, reason_str: ''};
  } else if (curr_epoch_s - target_data.diedAtEpoch > (resurrection)) {
    return {status: true, reason_str: ''};
  } else {
    let death_seconds = curr_epoch_s - target_data.diedAtEpoch;
    let return_seconds = (resurrection) - death_seconds;
    let hours = Math.floor(return_seconds / (60 * 60));
    let minutes = Math.floor((return_seconds - (hours * 60 * 60)) / 60);
    let reason_str = "They're dead! They come back to life in ";
    reason_str += `${hours} hours and ${minutes} minutes.`;
    return {status: false, reason_str: reason_str}
  }
}

function userCanAttack(user_data) {
  let curr_epoch_s = new Date().getTime() / 1000;
  if (Object.keys(user_data).length < 3) {
    return {status: true, reason_str: ''};
  } else if (user_data.isAlive == 1) {
    let seconds_since_attack = curr_epoch_s - user_data.lastAttackEpoch;
    if (seconds_since_attack > cooldown) {
      return {status: true, reason_str: ''};
    } else {
      let return_seconds = (cooldown) - seconds_since_attack;
      let minutes = Math.floor(return_seconds / 60);
      let seconds = Math.floor(return_seconds % 60);
      let reason_str = "You can't attack again yet! You can in ";
      reason_str += `${minutes} minutes and ${seconds} seconds.`;
      return {status: false, reason_str: reason_str};
    }
  } else if ((curr_epoch_s - user_data.diedAtEpoch) > (resurrection)) {
    return {status: true, reason_str: ''};
  } else {
    let death_seconds = curr_epoch_s - user_data.diedAtEpoch;
    let return_seconds = (resurrection) - death_seconds;
    let hours = Math.floor(return_seconds / (60 * 60));
    let minutes = Math.floor((return_seconds - (hours * 60 * 60)) / 60);
    let reason_str = "You're dead! You come back to life in ";
    reason_str += `${hours} hours and ${minutes} minutes.`
    return {status: false, reason_str: reason_str}
  }
}

function generateData(obj) {
  obj['isAlive'] = 1;
  obj['diedAtEpoch'] = 0;
  obj['lastAttackEpoch'] = 0;
  obj['health'] = health;
  obj['kills'] = 0;
  obj['deaths'] = 0;
  obj['weakened'] = 0;
  return obj;
}

function revive(obj) {
  obj.health = health;
  obj.isAlive = 1;
  return obj
}

function standard(user_data, target_data) {
  let curr_epoch_s = new Date().getTime() / 1000;
  let rolls = [];
  let rolls_sum = 0;
  let update_msg = `You roll ${std_n_die}d${std_d} (\``;
  for (let i = 0; i < std_n_die; i++) {
    let roll = Math.ceil(Math.random() * std_d);
    rolls.push(roll);
    rolls_sum += roll;
    update_msg += roll.toString() + '`, `';
  }
  update_msg = update_msg.slice(0, -3) + `) dealing ${rolls_sum} damage.`;
  if (target_data.weakened == 1) {
    rolls_sum = rolls_sum * 2;
    update_msg += ` Because they were weak, this is doubled to ${rolls_sum} damage.`;
  }
  update_msg = `<@${target_data.userId}> had ${target_data.health} health. ` + update_msg;
  user_data.lastAttackEpoch = curr_epoch_s;
  if (rolls_sum >= target_data.health) {
    update_msg += ` You killed <@${target_data.userId}>!`;
    target_data.health = 0;
    target_data.deaths += 1;
    target_data.isAlive = 0;
    target_data.diedAtEpoch = curr_epoch_s;
    user_data.kills += 1;
    target_data.weakened = 0;
  } else {
    update_msg += ` <@${target_data.userId}> is down to ${target_data.health - rolls_sum}/${health} health!`;
    target_data.health = target_data.health - rolls_sum;
  }
  let user_query = "REPLACE INTO data.hurt (userId, username, isAlive, diedAtEpoch, lastAttackEpoch, health, kills, deaths, weakened) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
  let user_values = [user_data.userId, user_data.username, user_data.isAlive, user_data.diedAtEpoch, user_data.lastAttackEpoch, user_data.health, user_data.kills, user_data.deaths, user_data.weakened];
  let target_query = "REPLACE INTO data.hurt (userId, username, isAlive, diedAtEpoch, lastAttackEpoch, health, kills, deaths, weakened) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
  let target_values = [target_data.userId, target_data.username, target_data.isAlive, target_data.diedAtEpoch, target_data.lastAttackEpoch, target_data.health, target_data.kills, target_data.deaths, target_data.weakened];
  async_query(user_query, user_values);
  async_query(target_query, target_values);
  return update_msg;
}

function risky(user_data, target_data) {
  let curr_epoch_s = new Date().getTime() / 1000;
  let rolls = [];
  let rolls_sum = 0;
  let update_msg = `You roll ${rsk_n_die}d${rsk_d} (\``;
  for (let i = 0; i < rsk_n_die; i++) {
    let roll = Math.ceil(Math.random() * rsk_d);
    rolls.push(roll);
    rolls_sum += roll;
    update_msg += roll.toString() + '`, `';
  }
  update_msg = update_msg.slice(0, -3) + `) dealing ${rolls_sum} damage.`;
  if (target_data.weakened == 1) {
    rolls_sum = rolls_sum * 2;
    update_msg += ` Because they were weak, this is doubled to ${rolls_sum} damage.`;
  }
  update_msg = `<@${target_data.userId}> had ${target_data.health} health. ` + update_msg;
  user_data.lastAttackEpoch = curr_epoch_s;
  if (rolls_sum >= target_data.health) {
    update_msg += ` You killed <@${target_data.userId}>!`;
    target_data.health = 0;
    target_data.deaths += 1;
    target_data.isAlive = 0;
    target_data.diedAtEpoch = curr_epoch_s;
    user_data.kills += 1;
    target_data.weakened = 0;
  } else {
    update_msg += ` <@${target_data.userId}> is down to ${target_data.health - rolls_sum}/${health} health!`;
    target_data.health = target_data.health - rolls_sum;
  }
  if (rolls_sum <= weakness_cutoff) {
    update_msg += ` \n\nBecause your roll was so terrible, you have been weakened! The next attack against you does double damage!`;
    user_data.weakened = 1;
  } else {
    user_data.weakened = 0;
  }
  let user_query = "REPLACE INTO data.hurt (userId, username, isAlive, diedAtEpoch, lastAttackEpoch, health, kills, deaths, weakened) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
  let user_values = [user_data.userId, user_data.username, user_data.isAlive, user_data.diedAtEpoch, user_data.lastAttackEpoch, user_data.health, user_data.kills, user_data.deaths, user_data.weakened];
  let target_query = "REPLACE INTO data.hurt (userId, username, isAlive, diedAtEpoch, lastAttackEpoch, health, kills, deaths, weakened) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
  let target_values = [target_data.userId, target_data.username, target_data.isAlive, target_data.diedAtEpoch, target_data.lastAttackEpoch, target_data.health, target_data.kills, target_data.deaths, target_data.weakened];
  async_query(user_query, user_values);
  async_query(target_query, target_values);
  return update_msg;
}


function kamikaze(user_data, target_data) {
  let curr_epoch_s = new Date().getTime() / 1000;
  let rolls = [];
  let rolls_sum = 0;
  let update_msg = `You roll ${kmk_n_die}d${kmk_target_d} (\``;
  for (let i = 0; i < kmk_n_die; i++) {
    let roll = Math.ceil(Math.random() * kmk_target_d);
    rolls.push(roll);
    rolls_sum += roll;
    update_msg += roll.toString() + '`, `';
  }
  let kamikaze_dmg = Math.ceil(Math.random() * kmk_user_d);
  update_msg = update_msg.slice(0, -3) + `) dealing ${rolls_sum} damage.`;
  if (target_data.weakened == 1) {
    rolls_sum = rolls_sum * 2;
    update_msg += ` Because they were weak, this is doubled to ${rolls_sum} damage.`;
  }
  update_msg = `<@${target_data.userId}> had ${target_data.health} health. ` + update_msg;
  user_data.lastAttackEpoch = curr_epoch_s;
  if (rolls_sum >= target_data.health) {
    update_msg += ` You killed <@${target_data.userId}>!`;
    target_data.health = 0;
    target_data.deaths += 1;
    target_data.isAlive = 0;
    target_data.diedAtEpoch = curr_epoch_s;
    user_data.kills += 1;
    target_data.weakened = 0;
  } else {
    update_msg += ` <@${target_data.userId}> is down to ${target_data.health - rolls_sum}/${health} health!`;
    target_data.health = target_data.health - rolls_sum;
  }
  update_msg += `\n\nYou were hurt by your kamikaze attack! You roll 1d${kmk_user_d}, causing ${kamikaze_dmg} damage`
  if (kamikaze_dmg > user_data.health) {
    user_data.deaths += 1;
    user_data.health = 0;
    user_data.isAlive = 0;
    user_data.diedAtEpoch = curr_epoch_s;
    user_data.weakened = 0;
    update_msg += ' and death. Rip.'
  } else {
    user_data.health = user_data.health - kamikaze_dmg;
    update_msg += `, bringing you down to ${user_data.health} health.`
  }
  let user_query = "REPLACE INTO data.hurt (userId, username, isAlive, diedAtEpoch, lastAttackEpoch, health, kills, deaths, weakened) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
  let user_values = [user_data.userId, user_data.username, user_data.isAlive, user_data.diedAtEpoch, user_data.lastAttackEpoch, user_data.health, user_data.kills, user_data.deaths, user_data.weakened];
  let target_query = "REPLACE INTO data.hurt (userId, username, isAlive, diedAtEpoch, lastAttackEpoch, health, kills, deaths, weakened) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
  let target_values = [target_data.userId, target_data.username, target_data.isAlive, target_data.diedAtEpoch, target_data.lastAttackEpoch, target_data.health, target_data.kills, target_data.deaths, target_data.weakened];
  async_query(user_query, user_values);
  async_query(target_query, target_values);
  return update_msg;
}


function heal(user_data, target_data) {
  let curr_epoch_s = new Date().getTime() / 1000;
  let rolls = [];
  let rolls_sum = 0;
  let update_msg = `You roll ${hl_n_die}d${hl_d} (\``;
  for (let i = 0; i < hl_n_die; i++) {
    let roll = Math.ceil(Math.random() * hl_d);
    rolls.push(roll);
    rolls_sum += roll;
    update_msg += roll.toString() + '`, `';
  }
  update_msg = update_msg.slice(0, -3) + `) healing ${rolls_sum} damage.`;
  update_msg = `<@${target_data.userId}> had ${target_data.health} health. ` + update_msg;
  user_data.lastAttackEpoch = curr_epoch_s;
  target_data.health = Math.min(rolls_sum + target_data.health, max_health);
  update_msg += ` <@${target_data.userId}> is up to ${target_data.health}/${health} health!`;
  let user_query = "REPLACE INTO data.hurt (userId, username, isAlive, diedAtEpoch, lastAttackEpoch, health, kills, deaths, weakened) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
  let user_values = [user_data.userId, user_data.username, user_data.isAlive, user_data.diedAtEpoch, user_data.lastAttackEpoch, user_data.health, user_data.kills, user_data.deaths, user_data.weakened];
  let target_query = "REPLACE INTO data.hurt (userId, username, isAlive, diedAtEpoch, lastAttackEpoch, health, kills, deaths, weakened) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
  let target_values = [target_data.userId, target_data.username, target_data.isAlive, target_data.diedAtEpoch, target_data.lastAttackEpoch, target_data.health, target_data.kills, target_data.deaths, target_data.weakened];
  async_query(user_query, user_values);
  async_query(target_query, target_values);
  return update_msg;
}

let func_obj = {
  'standard': standard,
  'risky': risky,
  'kamikaze': kamikaze,
  'heal': heal
}

module.exports = {
  type: "private",
  cat: "game",
  desc: "Hurt somebody!",
	data: new SlashCommandBuilder()
		.setName('hurt')
		.setDescription("Hurt somebody.")
		.addUserOption(option => option
      .setName('target')
      .setDescription('User to be renamed.')
      .setRequired(true)
    ).addStringOption(option => option
      .setName('type')
      .setDescription('Desired nickname for target.')
      .setRequired(true)
      .addChoices({name:'Standard', value:'standard'}).addChoices({name:'Risky', value:'risky'})
      .addChoices({name:'Kamikaze', value:'kamikaze'}).addChoices({name:'Heal', value:'heal'})
    ),
	async execute(interaction) {
    let user_id = interaction.user.id;
    let target = interaction.options.getUser('target')
    let target_id = target.id;
    if (user_id == target_id) {
      interaction.reply("You can't target yourself!");
      return;
    }
    let type = interaction.options.getString('type');
    let query = "SELECT * FROM data.hurt WHERE userId = ? OR userId = ?;"
    let values = [user_id, target_id]
    let result = await async_query(query, values);
    let user_row_index = -1;
    let target_row_index = -1;
    let target_data, user_data;
    for (let i = 0; i < result.length; i++) {
      if (result[i].userId == user_id) {user_row_index = i}
      if (result[i].userId == target_id) {target_row_index = i}
    }
    if (user_row_index === -1) {
      user_data = {userId: user_id, username: interaction.user.username};
    } else {
      user_data = result[user_row_index];
    }
    if (target_row_index === -1) {
      target_data = {userId: target_id, username: target.username};
    } else {
      target_data = result[target_row_index];
    }
    let user_status = userCanAttack(user_data);
    let target_status = targetIsAlive(target_data);
    if (user_status.status == false) {
      interaction.reply(user_status.reason_str);
      return;
    }
    if (target_status.status == false) {
      interaction.reply(target_status.reason_str);
      return;
    }
    if (Object.keys(user_data).length < 3) {user_data = generateData(user_data)}
    if (Object.keys(target_data).length < 3) {target_data = generateData(target_data)}
    if (user_data.health <= 0) {user_data = revive(user_data)}
    if (target_data.health <= 0) {target_data = revive(target_data)}
    interaction.reply(func_obj[type](user_data, target_data));
	},
};

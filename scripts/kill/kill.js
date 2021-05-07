"use strict";

// Define Constants and key Variables
const f = require('../../funcs.js');
const fs = require('fs');
const kill_filename = './kill.json';
const kill_filename_full = './scripts/kill/kill.json';
var kill_json = require(kill_filename);

function reviveSeconds(msg, id) {
  // Only call if they're dead (which guarantees they're in the json), returns int
  let last_killed_at = kill_json[id].last_killed_at;
  let death_exp = kill_json[id].death_exp;
  let revive_mseconds = last_killed_at + death_exp - msg.createdTimestamp;
  console.log(revive_mseconds)
  return revive_mseconds / 1000;
}

function killSeconds(msg, id) {
  // Only call if they've killed (which guarantees they're in the json), returns int
  let last_kill = kill_json[id].last_kill;
  let kill_exp = kill_json[id].kill_exp;
  let kill_mseconds = last_kill + kill_exp - msg.createdTimestamp;
  return kill_mseconds / 1000;
}

function minutesAndSeconds(n) {
  // seconds integer to minutes and seconds string
  let minutes = Math.floor(n / 60);
  let seconds = Math.round(n - (minutes * 60));
  if (minutes > 0) {
    return `${minutes} minutes and ${seconds} seconds`
  } else {
    return `${seconds} seconds`
  }
}

function hoursMinutesAndSeconds(n) {
  // seconds integer to minutes and seconds string
  let hours = Math.floor(n / 3600)
  let m_and_s = minutesAndSeconds(n - (3600 * hours))
  if (hours > 0) {
    return `${hours} hours, ${m_and_s}`
  } else {
    return m_and_s
  }
}

function isDead(msg, id) {
  // Checks if they're dead, returns true/false, false if not in json
  if (!(id in kill_json) || !("last_killed_at" in kill_json[id])) {return false;}
  let last_killed_at = kill_json[id].last_killed_at;
  let death_expiration = kill_json[id].death_exp;
  console.log(last_killed_at, death_expiration, "sum", last_killed_at + death_expiration)
  if (last_killed_at + death_expiration < msg.createdTimestamp) {
    return false
  } else {
    return true
  }
}

function kill(msg, content) {
  console.log(msg.createdTimestamp)
  // Check if murderer is dead
  let murderer_id = msg.author.id;
  if (isDead(msg, murderer_id)) {
    let time = hoursMinutesAndSeconds(reviveSeconds(msg, murderer_id));
    msg.reply(`You're dead, you can't kill anyone! (But maybe you can in ${time}.)`)
    return ;
  }
  if (msg.mentions.users.size === 1) {
    let victim_id = msg.mentions.users.first().id;
    let victim_name = msg.mentions.users.first().username;
    let murderer_name = msg.author.username;
    // Check if victim is already dead
    if (isDead(msg, victim_id)) {
      let time = hoursMinutesAndSeconds(reviveSeconds(msg, victim_id));
      msg.channel.send(`They're already dead! Maybe they'll come back to life in ${time}.`)
      return ;
    }
    // Check if murderer killed too recently.
    if (
      murderer_id in kill_json && "last_kill" in kill_json[murderer_id] &&
      kill_json[murderer_id].last_kill + kill_json[murderer_id].kill_exp > msg.createdTimestamp
    ) {
      let time = minutesAndSeconds(killSeconds(msg, murderer_id))
      msg.reply(`You can't murder again so soon, you'll get caught! Try again in ${time}.`)
      return ;
    }
    // Do the kill
    msg.channel.send(murderer_name + " just murdered " + victim_name + ". So sad!");
    // Update stats and save
    if (!(murderer_id in kill_json)) {kill_json[murderer_id] = {"kills": 0};}
    if (!(victim_id in kill_json)) {kill_json[victim_id] = {"deaths": 0};}
    kill_json[murderer_id]["username"] = murderer_name;
    kill_json[murderer_id]["last_kill"] = msg.createdTimestamp;
    kill_json[murderer_id]["kill_exp"] = 5 * 1000;
    kill_json[murderer_id]["kills"]++;
    kill_json[victim_id]["username"] = victim_name;
    kill_json[victim_id]["last_killed_at"] = msg.createdTimestamp;
    kill_json[victim_id]["death_exp"] = 3600 * 1000 * 24;
    kill_json[victim_id]["deaths"]++;
    console.log(kill_json)
    fs.writeFileSync(kill_filename_full, JSON.stringify(kill_json, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
  } else {
  msg.channel.send("You need to mention your victim.");
  }
}

module.exports = { kill };

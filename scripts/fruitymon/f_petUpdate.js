"use strict";

// Define constants
const f = require('../../funcs.js');
const fs = require('fs');
const c = require('./f_config.js');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
const f_record = require(record_filename);

function updatePets(msg) {
  for (var key in f_record) {
    if ("Animals" in f_record[key]) {
      for (let i = 0; i < f_record[key]["Animals"].length; i++) {
        if (!("Last Update" in f_record[key]["Animals"][i])) {
          f_record[key]["Animals"][i]["Last Update"] = msg.createdTimestamp;
          f_record[key]["Animals"][i] = updatePet(msg, f_record[key]["Animals"][i]);
        } else {
          while (f_record[key]["Animals"][i]["Last Update"] + (3600 * 1000) < msg.createdTimestamp) {
            f_record[key]["Animals"][i]["Last Update"] += (3600 * 1000)
            f_record[key]["Animals"][i] = updatePet(msg, f_record[key]["Animals"][i]);
          }
        }
      }
    }
  }
}

function updatePet(msg, animal) {
  // Handle hunger, health, status, emoji changes.
  if (animal["curr_hunger"] > 0) {
    animal["curr_hunger"]--;
    animal["status"] = "alive"
  } else if (animal["curr_health"] > 0) {
    animal["curr_health"]--;
    animal["status"] = "alive"
  } else {
    animal["emoji"] = "🪦"
    animal["status"] = "dead"
  }
  // Only living adults get to make new stuff
  let age_ms = msg.createdTimestamp - animal.dob;
  let age_frac = age_ms / (animal.hours_to_maturity * 3600 * 1000)
  if (age_frac < 1 || animal["status"] === "dead") return animal;
  // Check if full capacity
  if (animal.inv.length >= animal.capacity) return animal;
  // Make new stuff
  if (!("remainder" in animal)) {animal["remainder"] = 0}
  let new_items = Math.floor((animal.remainder + animal.base_speed) / 10);
  animal["remainder"] = (animal.remainder + animal.base_speed) % 10;
  // Get item array...
  let arr = [];
  for (var item in animal.generation) {
    arr = arr.concat(Array(animal.generation[item].freq).fill(animal.generation[item].str))
  }
  console.log("the array is ", arr)
  let index = Math.min(arr.length - 1, Math.floor(Math.random() * arr.length) + animal.base_freq);
  index = Math.max(0, index);
  console.log("the index is", index)
  animal.inv.push(animal.generation[arr[index]])
  console.log("what got pushed", animal.generation[arr[index]])
  return animal
}

module.exports = {updatePets}

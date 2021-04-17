"use strict";

// Import
const fs = require('fs');

// This script is for basic functions to be used by all other scripts.

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function rollDie(sides) {
  return Math.ceil(Math.random()*sides);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function secondsAndMinutes(seconds) {
  return Math.floor(seconds/60) + " minutes and " + seconds % 60 + " seconds";
}

function backup(dest_folder, filename_array) {
  console.log("trying to backup :(")
  let today = new Date().toISOString().slice(0, 10)
  for (let i = 0; i < filename_array.length; i++) {
    let shortname = filename_array[i].split('/').slice(-1)[0].split('.')[0]
    console.log("reading file")
    let json = require(filename_array[i]);
    console.log("REad the file, now saving it to " + "./" + dest_folder + "/" + shortname)
    fs.writeFile(
      "./" + dest_folder + "/" + shortname + "-" + today + '.json',
      JSON.stringify(json, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );
  }
}

module.exports = { isNumeric, rollDie, shuffle, secondsAndMinutes, backup };

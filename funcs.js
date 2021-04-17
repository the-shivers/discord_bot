"use strict";

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
  return Math.round(seconds/60) + " minutes and " + seconds % 60 + " seconds";
}

module.exports = { isNumeric, rollDie, shuffle, secondsAndMinutes };

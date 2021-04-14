"use strict";

// This script is for basic functions to be used by all other scripts.

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

module.exports = { isNumeric };

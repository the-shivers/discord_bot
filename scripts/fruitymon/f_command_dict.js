"use strict";

// Imports
const tiers = require('./f_tiers.js');
const pick = require('./f_pick.js');

let f_command_dict = {
  "tiers": {
    "log": "Showing fruit tiers!",
    "func": tiers.tiers
  },
  "pick": {
    "log": "Picking fruit!",
    "func": pick.pick
  }
}

module.exports = { f_command_dict };

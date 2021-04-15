"use strict";

// Imports
const tiers = require('./f_tiers.js');
const pick = require('./f_pick.js');
const inventory = require('./inventory.js');

let f_command_dict = {
  "tiers": {
    "log": "Showing fruit tiers!",
    "func": tiers.tiers
  },
  "pick": {
    "log": "Picking fruit!",
    "func": pick.pick
  },
  "inventory": {
    "log": "Showing an inventory",
    "func": inventory.inventory
  }
}


module.exports = { f_command_dict };

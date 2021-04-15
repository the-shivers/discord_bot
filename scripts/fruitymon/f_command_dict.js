"use strict";

// Imports
const tiers = require('./f_tiers.js');
const pick = require('./f_pick.js');
const inventory = require('./inventory.js');
const f_help = require('./f_help.js');

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
  },
  "help": {
    "log": "Helping with fruit!",
    "func": f_help.f_help
  }
}


module.exports = { f_command_dict };

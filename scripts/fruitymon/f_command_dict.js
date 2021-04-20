"use strict";

// Imports
const tiers = require('./f_tiers.js');
const pick = require('./f_pick.js');
const perk = require('./f_perks.js');
const inventory = require('./inventory.js');
const f_help = require('./f_help.js');
const f_stats = require('./f_stats.js');
const f_shop = require('./f_shop.js');
const f_reset = require('./f_reset.js');
const f_cheat = require('./f_cheat.js');

let f_command_dict = {
  "tiers": {
    "log": "Showing fruit tiers!",
    "func": tiers.tiers
  },
  "pick": {
    "log": "Picking fruit!",
    "func": pick.pick
  },
  "perks": {
    "log": "Displaying perks!",
    "func": perk.perk
  },
  "perk": {
    "log": "Displaying perks!",
    "func": perk.perk
  },
  "inventory": {
    "log": "Showing an inventory",
    "func": inventory.inventory
  },
  "inv": {
    "log": "Showing an inventory",
    "func": inventory.inventory
  },
  "help": {
    "log": "Helping with fruit!",
    "func": f_help.f_help
  },
  "stats": {
    "log": "Showing fruit statistics!",
    "func": f_stats.stats
  },
  "shop": {
    "log": "Showing shoppy woppy!",
    "func": f_shop.f_shop
  },
  "reset": {
    "log": "Resetting someone's stats!",
    "func": f_reset.f_reset
  },
  "cheat": {
    "log": "Helping someone cheat!",
    "func": f_cheat.f_cheat
  },
  "buy": {
    "log": "Shop buying.",
    "func": f_shop.f_buy
  },
  "sell": {
    "log": "Shop selling.",
    "func": f_shop.f_sell
  }
}


module.exports = { f_command_dict };

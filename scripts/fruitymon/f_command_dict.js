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
const f_steal = require('./f_steal.js');
const f_shoot = require('./f_shoot.js');
const give = require('./give.js');
const f_chart = require('./f_chart.js');

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
  },
  "steal": {
    "log": "STEALING.",
    "func": f_steal.f_steal
  },
  "steal_m": {
    "log": "STEALING MONEY.",
    "func": f_steal.f_steal_m
  },
  "give": {
    "log": "Giving fruits :).",
    "func": give.f_give
  },
  "give_m": {
    "log": "Sharing the wealth.",
    "func": give.f_give_m
  },
  "shoot": {
    "log": "kapow!",
    "func": f_shoot.f_shoot
  },
  "chart": {
    "log": "Charting a fruit!!!",
    "func": f_chart.f_chart
  }
}


module.exports = { f_command_dict };

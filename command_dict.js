"use strict";

// Imports
const tarot = require('./scripts/tarot/tarot.js');
const rpg = require('./scripts/rpg/rpg.js');
const ud = require('./scripts/ud/ud.js');
const dice = require('./scripts/dice/dice.js');
const avatar = require('./scripts/avatar/avatar.js');
const pingpong = require('./scripts/pingpong/pingpong.js');
const prune = require('./scripts/prune/prune.js');
const nick = require('./scripts/nick/nick.js');
const weather = require('./scripts/weather/weather.js');
const help = require('./scripts/help/help.js');
const bing = require('./scripts/bing/bing.js');
const bingw = require('./scripts/bing/bingw.js');
const wa = require('./scripts/wolframalpha/wolframalpha.js');
const smack = require('./scripts/smack/smack.js');
const fruitymon = require('./scripts/fruitymon/fruitymon.js');
const sona = require('./scripts/sona/sona.js');
const crypto = require('./scripts/crypto/crypto.js');
const ml = require('./scripts/ml/ml.js');

let command_dict = {
  "tarot": {
    "log": "Predicting the future",
    "func": tarot.tarot
  },
  "rpg": {
    "log": "Generating RPG character.",
    "func": rpg.rpg
  },
  "avatar": {
    "log": "Fetching avatar.",
    "func": avatar.getAvatar
  },
  "roll": {
    "log": "Rolling dice.",
    "func": dice.multiDice
  },
  "r": {
    "log": "Rolling dice.",
    "func": dice.multiDice
  },
  "ud": {
    "log": "Fetching urban wisdom.",
    "func": ud.ud
  },
  "ping": {
    "log": "Pinged, so I pong!.",
    "func": pingpong.ping
  },
  "pong": {
    "log": "Ponged, so I ping!",
    "func": pingpong.pong
  },
  "trick": {
    "log": "Tricking evil mashi.",
    "func": pingpong.trick
  },
  "prune": {
    "log": "Prunin'.",
    "func": prune.prune
  },
  "nick": {
    "log": "Renaming someone.",
    "func": nick.nick
  },
  "weather": {
    "log": "Fetching weather.",
    "func": weather.weather
  },
  "w": {
    "log": "Fetching weather.",
    "func": weather.weather
  },
  "help": {
    "log": "Helping someone!",
    "func": help.help
  },
  "bi": {
    "log": "Just bing it, bro!",
    "func": bing.bing
  },
  "wa": {
    "log": "Math time, with WA!",
    "func": wa.wolframAlpha
  },
  "smack": {
    "log": "Initiating violence!",
    "func": smack.smack
  },
  "f": {
    "log": "Initiating fruit!",
    "func": fruitymon.f
  },
  "bw": {
    "log": "Binging words.",
    "func": bingw.bingw
  },
  "bn": {
    "log": "Binging news.",
    "func": bingw.bingn
  },
  "sona": {
    "log": "Generating 'sona'.",
    "func": sona.sona
  },
  "persona": {
    "log": "Predicting the future",
    "func": tarot.tarot
  },
  "crypto": {
    "log": "HODLing against fudders...",
    "func": crypto.crypto
  },
  "ml": {
    "log": "Running mad libs.",
    "func": ml.ml
  },
  "mladd": {
    "log": "Running mad libs (adding).",
    "func": ml.mladd
  }
};

module.exports = { command_dict };

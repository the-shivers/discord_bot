"use strict";

// Imports
const c = require('./f_config.js');
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const Discord = require('discord.js');



function f_shop(msg, content) {
  msg.channel.send("SHOPPING LOOOOOOOOOOOOOL");
}





module.exports = {f_shop};

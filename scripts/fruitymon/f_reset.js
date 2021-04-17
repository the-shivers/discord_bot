"use strict";

// Import
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);

function f_reset(msg, content) {
  msg.channel.send('resetting');
  delete f_record[msg.author.id]
  fs.writeFile(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

module.exports = {f_reset};

"use strict";

// Import
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);

function f_cheat(msg, content) {
  console.log(content);
  if (f.isNumeric(content) && msg.author.id === "790037139546570802") {
    msg.channel.send("Roll delay set to " + content);
    f_record[msg.author.id]["Roll Delay"] = parseInt(content);
    fs.writeFile(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
  } else {
    msg.channel.send("I don't think so, bub!");
  }
}

module.exports = {f_cheat};

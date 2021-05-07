"use strict";

// Import
const f = require('../../funcs.js');
const fs = require('fs');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);

function f_cheat(msg, content) {
  console.log(content);
  if (content.trim() === "reset_all_perks" && msg.author.id === "790037139546570802") {
    for (var key in f_record) {
      f_record[key]["Perks"] = [];
      f_record[key]["Pick Limit"] = 5;
      f_record[key]["Number of Dice"] = 5;
      f_record[key]["Dice Sides"] = 100;
    }
    msg.channel.send("All perks have been reset. Sorry y'all!");
    fs.writeFile(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
    return;
  } else if (msg.author.id === "790037139546570802" && content.split(' ').length === 3 && content.split(' ')[0].trim() === "punish") {
    if (msg.mentions.users.size > 0 && f.isNumeric(content.split(' ')[2])) {
      let id = msg.mentions.users.first().id
      f_record[id]["Pick Limit"] = parseInt(content.split(' ')[2]);
      msg.channel.send(`${msg.mentions.users.first().username} got fucked. Their pick limit is now \`${f_record[id]["Pick Limit"]}\`.`);
      fs.writeFile(record_filename_full, JSON.stringify(f_record, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
      });
    } else {
      msg.channel.send("Based attempt, but you must mention someone. Or give a number.")
    }

  } else if (f.isNumeric(content) && msg.author.id === "790037139546570802") {
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

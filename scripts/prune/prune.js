"use strict";

// Define Constants and key Variables
const f = require('../../funcs.js');

async function prune(msg, content) {
  if (
    content.split(' ').length === 2
    && f.isNumeric(content.split(" ")[1])
  ) {
      let prune_num = Math.abs(parseInt(content.split(" ")[1], 10));
      if (prune_num > 20)
        {
          msg.channel.send("Are you crazy? That's too many!")
        } else {
          let dels = await msg.channel.messages.fetch({limit: prune_num + 1});
          msg.channel.bulkDelete(dels);
          msg.channel.send("Deleted " + prune_num.toString() + " messages." );
        }
    } else {
    msg.channel.send("Try again, but better.")
  }
}

module.exports = { prune };

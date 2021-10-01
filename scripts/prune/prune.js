"use strict";

// Define Constants and key Variables
const f = require('../../funcs.js');

async function prune(msg, content) {
  if (msg.author.id === "243314148698619905" || msg.author.id === "340310812952363009" || msg.author.id === "831357409192443905") {
    msg.channel.send("fuck off bird!");
    return;
  }
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

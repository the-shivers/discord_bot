"use strict";

// Define Constants
const Discord = require("discord.js");

function getAvatar(msg, content) {
  let embed = new Discord.MessageEmbed().setDescription('Looking sharp! :3');
  if (content === "avatar") {
    embed.setImage(msg.author.avatarURL({ format: 'jpg' }) + '?size=256');
    msg.reply(embed);
  } else if (msg.mentions.users.size > 0) {
    embed.setImage(msg.mentions.users.first().avatarURL({ format: 'jpg' }) + '?size=256');
    msg.reply(embed);
  } else {
    msg.reply("Invalid!");
  }
}

module.exports = { getAvatar };

"use strict";

async function nick(msg, content) {
  if (
    msg.mentions.users.size === 1
    && content.split(' ').length > 2
  ) {
    let user_id = msg.mentions.users.first().id;
    let split_content = content.split(" ");
    if (split_content[1] === "<@!" + user_id + ">") {
      let new_nick = split_content.slice(2).join(" ");
      let user = await msg.guild.members.fetch(user_id);
      let username = user.user.username;
      user.setNickname(new_nick).then(
        success => {
          msg.channel.send(username + " is now named <@" + user_id + ">!");
        }, failure => {
          msg.channel.send("You are too powerful to rename. :(");
        }
      )
    }
  } else {
    msg.channel.send("Invalid input. :(");
  }
}

module.exports = { nick };

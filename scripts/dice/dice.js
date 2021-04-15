"use strict";

// Define Constants and key Variables
const f = require('../../funcs.js');

function multiDice(msg, content) {
  // Takes a string of the form 3d10 and returns a dice roll string.

  let return_str = "";

  if (content.split(' ').length === 2) {
    let cmd_str = content.split(' ')[1];
    if (
      cmd_str.includes('d') &&
      f.isNumeric(cmd_str.split('d')[1])
    ) {
      if (f.isNumeric(cmd_str.split('d')[0])) {
        let send_str = "";
        let num_dice = Math.abs(parseInt(cmd_str.split('d')[0]));
        let dice_val = parseInt(cmd_str.split('d')[1]);
        if (num_dice > 200) {
          msg.channel.send("Are you crazy? That's so many dice! (Max: 100)");
        } else if (Math.abs(dice_val) * num_dice > 10000000000) {
          msg.channel.send("That's gonna make the message too long, come on!");
        } else {
          let i;
          let sum = 0;
          for (i = 0; i < num_dice; i++) {
            let roll = f.rollDie(dice_val);
            send_str += "`" + roll.toString() + "`,";
            sum += roll;
          }
          return_str = send_str.slice(0, -1) + ".\nSum is `"
          + sum.toString() + "`";
        }
      } else {
        return_str = "`" + f.rollDie(parseInt(cmd_str.split('d')[1])).toString()
        + "`";
      }
    } else {
      return_str = "Invalid.";
    }
  } else {
    return_str = "Invalid.";
  }
  msg.channel.send(return_str);
}

module.exports = { multiDice };

"use strict";
//
const { async_query } = require('../db/scripts/db_funcs.js')
const { start_round } = require('../scripts/wwtbam_start_round.js')
const { MessageActionRow } = require('discord.js');
const { update_lifelines } = require('./wwtbam_friend.js');

function update_choices(row_components) {
  // big brain math lol
  // why randomize the list when u can do based math
  const new_choices = new MessageActionRow();
  let false_count = 0;
  let disabled_count = 0
  for (let i = 0; i < row_components.length; i++) {
    if (row_components[i].customId === 'wwtbam_t') {
      new_choices.addComponents(row_components[i])
    } else {
      if (disabled_count === 2) {
        new_choices.addComponents(row_components[i])
      } else {
        let prob = Math.random();
        if (false_count === 0) {
          if (prob < 0.6667) {
            new_choices.addComponents(row_components[i].setDisabled(true))
            disabled_count++;
            false_count++;
          } else {
            new_choices.addComponents(row_components[i])
            false_count++;
          }
        } else if (false_count === 1 && disabled_count === 0) {
          new_choices.addComponents(row_components[i].setDisabled(true))
          disabled_count++;
          false_count++;
        } else if (false_count === 1 && disabled_count === 1) {
          if (prob < 0.5) {
            new_choices.addComponents(row_components[i].setDisabled(true))
            disabled_count++;
            false_count++;
          } else {
            new_choices.addComponents(row_components[i])
            false_count++;
          }
        } else if (false_count === 2 && disabled_count === 1) {
          new_choices.addComponents(row_components[i].setDisabled(true))
          disabled_count++;
          false_count++;
        }
      }
    }
  }
  return new_choices;
}


module.exports = {
	async execute(interaction) {
    let query = "SELECT * FROM data.wwtbam_status WHERE channelId = ?";
    let values = [interaction.channelId];
    let status = await async_query(query, values);
    if (status[0].userId !== interaction.user.id) {
      interaction.reply({
        content: "You're not even playing!",
        ephemeral: true
      })
    } else if (status[0].is_available_50_50 === 0) {
        interaction.reply({
          content: "That lifeline isn't available!",
          ephemeral: true
        })
    } else if (status[0].is_available_50_50 === 1) {
      let choices = update_choices(interaction.message.components[0].components)
      let lifes = update_lifelines(
        interaction.message.components[1].components, 'wwtbam_50_50'
      )
      interaction.update({
        components: [choices, lifes]
      })
      query = 'UPDATE data.wwtbam_status SET channelId = ?, guildId = ?, ';
      query += 'userId = ?, status = ?, question_num = ?, is_available_50_50 =';
      query += ' ?, is_available_audience = ?, is_available_friend = ?, ';
      query += 'updatedAt = ? WHERE channelId = ?;';
      values = Object.values(status[0])
      values[5] = 0;
      values.push(values[0]);
      async_query(query, values);
    } else {
      console.log("You should never see this message (50/50 is disabled).")
    }
  }
};

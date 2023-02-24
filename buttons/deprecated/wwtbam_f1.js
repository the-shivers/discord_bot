"use strict";

const { identify_correct_answer } = require('./wwtbam_friend.js');
const { async_query } = require('../db/scripts/db_funcs.js');

function get_winnings(q_num) {
  if (q_num < 5) return '$0';
  if (q_num < 10) return '$1,000';
  return '$32,000';
}

function identify_chosen_answer(interaction) {
  let th = __filename.replace(__dirname);
  for (let i = 0; i < 4; i++) {
    if (interaction.message.components[0].components[i].customId === interaction.customId) {
      return interaction.message.components[0].components[i].label
    }
  }
}

module.exports = {
  async execute(interaction) {
    let query = "SELECT * FROM data.wwtbam_status WHERE channelId = ?";
    let values = [interaction.channelId];
    let status = await async_query(query, values);
    if (status[0].userId !== interaction.user.id) {
      interaction.reply({
        content: "You're not even playing! But if you're curious, you got it ||wrong||.",
        ephemeral: true
      })
    } else {
      let winnings = get_winnings(status[0].question_num)
      query = 'UPDATE data.wwtbam_status SET channelId = ?, guildId = ?, ';
      query += 'userId = ?, status = ?, question_num = ?, is_available_50_50 =';
      query += ' ?, is_available_audience = ?, is_available_friend = ?, ';
      query += 'updatedAt = ? WHERE channelId = ?;';
      status[0].userId = '0' * 18; status[0].status = 0;
      status[0].question_num = 0; status[0].is_available_50_50 = 1;
      status[0].is_available_friend = 1; status[0].is_available_audience = 1;
      status[0].updatedAt = interaction.createdAt;
      values = Object.values(status[0])
      values.push(values[0])
      async_query(query, values);
      let answer = identify_correct_answer(interaction)
      let choice = identify_chosen_answer(interaction)
      let content = `You chose \`${choice}\`. Bummer... \`${answer}\` was correct.\n You won \`${winnings}\`!`;
      interaction.reply(content);
    }
  }
}

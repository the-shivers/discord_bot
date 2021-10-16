"use strict";

const { identify_correct_answer } = require('./wwtbam_friend.js');
const { async_query } = require('../db/scripts/db_funcs.js');
const { money_arr } = require('../scripts/wwtbam_start_round.js');

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
    } else {
      money_arr.unshift('$0')
      let winnings = money_arr[status[0].question_num];
      query = 'UPDATE data.wwtbam_status SET channelId = ?, guildId = ?, ';
      query += 'userId = ?, status = ?, question_num = ?, is_available_50_50 =';
      query += ' ?, is_available_audience = ?, is_available_friend = ?, ';
      query += 'updatedAt = ? WHERE channelId = ?;';
      status[0].userId = '0' * 18; status[0].status = 0;
      status[0].question_num = 1; status[0].is_available_50_50 = 1;
      status[0].is_available_friend = 1; status[0].is_available_audience = 1;
      status[0].updatedAt = interaction.createdAt;
      values = Object.values(status[0])
      values.push(values[0])
      async_query(query, values);
      let answer = identify_correct_answer(interaction)
      let content = `You won \`${winnings}\`! Thanks for playing! By the way, \`${answer}\` was correct.`;
      interaction.reply(content);
    }
  }
}

"use strict";

const { identify_correct_answer } = require('./wwtbam_friend.js');
const { async_query } = require('../db/scripts/db_funcs.js');
const { start_round } = require('../scripts/wwtbam_start_round.js');

module.exports = {
  async execute(interaction) {
    let query = "SELECT * FROM data.wwtbam_status WHERE channelId = ?";
    let values = [interaction.channelId];
    let status = await async_query(query, values);
    if (status[0].userId !== interaction.user.id) {
      interaction.reply({
        content: "You're not even playing! But if you're curious, you got it ||right||.",
        ephemeral: true
      })
    } else {
      query = 'UPDATE data.wwtbam_status SET channelId = ?, guildId = ?, ';
      query += 'userId = ?, status = ?, question_num = ?, is_available_50_50 =';
      query += ' ?, is_available_audience = ?, is_available_friend = ?, ';
      query += 'updatedAt = ? WHERE channelId = ?;';
      status[0].question_num++;
      values = Object.values(status[0])
      values.push(values[0])
      async_query(query, values);
      let answer = identify_correct_answer(interaction)
      let content = `Nailed it! \`${answer}\` was correct!`;
      start_round(interaction, status[0], content)
    }
  }
}

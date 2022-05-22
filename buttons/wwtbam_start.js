"use strict";

const {MessageAttachment, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const { start_round } = require('../scripts/wwtbam_start_round.js')

// The idea: start start game updates the entry for the first time.
// button interactions will update database so that start round doesn't fuck up.
// in both cases they call another function, start_round.

async function update_game_status(interaction, status_result) {
  let values = [
    interaction.channelId, interaction.guildId, interaction.user.id,
    1, // new status
    0, // question index
    1, // 5050
    1, // audience
    1, // friend
    interaction.createdAt
  ];
  if (status_result.length === 0) {
    var query = 'INSERT INTO data.wwtbam_status VALUES (?, ?, ?, ?, ?, ?, ?, '
    query += '?, ?);'
  } else if (
    status_result[0].status === 0 ||
    (
      status_result[0].status === 1 &&
      (interaction.createdAt - status_result[0].updatedAt) / 1000 > 300
    )
  ) {
    var query = 'UPDATE data.wwtbam_status SET channelId = ?, guildId = ?, ';
    query += 'userId = ?, status = ?, question_num = ?, is_available_50_50 =';
    query += ' ?, is_available_audience = ?, is_available_friend = ?, ';
    query += 'updatedAt = ? WHERE channelId = ?;';
    values.push(interaction.channelId);
  } else if (status_result[0].status === 1 ) {
    console.log("You should never see this. It should not be possible.")
  }
  await async_query(query, values);
}

module.exports = {
	async execute(interaction) {
    const query = "SELECT * FROM data.wwtbam_status WHERE channelId = ?";
    const values = [interaction.channelId];
    let status = await async_query(query, values);
    await update_game_status(interaction, status);
    if (status.length === 0) {
      status = await async_query(query, values);
    }
    start_round(interaction, status[0]);
	},
};

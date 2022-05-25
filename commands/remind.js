"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const { async_query } = require('../db/scripts/db_funcs.js')

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Create a reminder and get pinged in the future.",
	data: new SlashCommandBuilder()
		.setName('remind')
		.setDescription('Create a reminder and get pinged in the future.')
    .addStringOption(option => option
      .setName('message')
      .setDescription("The message that will be sent when your reminder occurs.")
      .setRequired(true)
    ).addIntegerOption(option => option
      .setName('weeks')
      .setDescription('Weeks until your reminder occurs.')
    ).addIntegerOption(option => option
      .setName('days')
      .setDescription('Days until your reminder occurs.')
    ).addIntegerOption(option => option
      .setName('hours')
      .setDescription('Hours until your reminder occurs.')
    ).addIntegerOption(option => option
      .setName('minutes')
      .setDescription('Minutes until your reminder occurs.')
    ),
	async execute(interaction) {
    let message = interaction.options.getString('message');
    let weeks = interaction.options.getInteger('weeks') ?? 0;
    let days = interaction.options.getInteger('days') ?? 0;
    let hours = interaction.options.getInteger('hours') ?? 0;
    let minutes = interaction.options.getInteger('minutes') ?? 0;
    let remind_seconds = minutes * 60 + hours * 60 * 60 + days * 60 * 60 * 24 + weeks * 60 * 60 * 24 * 7;
    if (remind_seconds <= 60) {
      interaction.reply('You need to set the reminder at least 60 seconds into the future.');
      return;
    }
    let epoch_seconds = Math.floor(new Date().getTime() / 1000);
    const query = "INSERT INTO data.reminders (userId, channelId, message, responded, epoch) VALUES (?, ?, ?, ?, ?);";
    const values = [interaction.user.id, interaction.channelId, message, 0, epoch_seconds + remind_seconds];
    let result = await async_query(query, values);
    interaction.reply(`Reminder set for ${weeks} weeks, ${days} days, ${hours} hours, and ${minutes} minutes from now!`)
	}
};

"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const keys = require("../api_keys.json").novelai;

let url = 'https://api.novelai.net/ai/generate'
let config = {headers: {Authorization: `Bearer ${keys.token}`}};
let body = {
  model: 'euterpe-v2',
  parameters: {
    use_string: true,
    temperature: 0.63,
    min_length: 500,
    max_length: 2048
  }
};

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Let AI complete your story.",
	data: new SlashCommandBuilder()
		.setName('ai')
		.setDescription('Let AI complete your story.')
    .addStringOption(option => option
      .setName('input')
      .setDescription('Statement for the AI to complete (Max: 1500 characters).')
      .setRequired(true)
    ),
	async execute(interaction) {
		await interaction.deferReply();
    let input = interaction.options.getString('input');
    if (input.length < 5) {
      interaction.editReply("You gotta give me more to work with!");
      return;
    } else if (input.length > 1500) {
      interaction.editReply("That's too much input! Keep it less than 1,500 characters!");
      return;
    }
    body.input = input;
    let result = await axios.post(url, body, config)
    if (result.status != 201) {
      interaction.editReply("The AI went rogue and refused!");
      return;
    }
    interaction.editReply(result.data.output)
	}
}

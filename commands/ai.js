"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const keys = require("../api_keys.json").novelai;

function getAdditionalParameters(body, preset) {
  if (preset = 'Genesis') {
    body.parameters.repetition_penalty = 1.148125,
    body.parameters.repetition_penalty_frequency = 0,
    body.parameters.repetition_penalty_presence = 0,
    body.parameters.repetition_penalty_range = 2048,
    body.parameters.repetition_penalty_slope = 0.09,
    body.parameters.return_full_text = false,
    body.parameters.tail_free_sampling = 0.975,
    body.parameters.temperature = 0.63,
    body.parameters.top_k = 0,
    body.parameters.top_p = 0.975,
    body.parameters.use_cache = false
  }
  return body;
}

let url = 'https://api.novelai.net/ai/generate'
let config = {headers: {Authorization: `Bearer ${keys.token}`}};
let body = {
  model: 'euterpe-v2',
  parameters: {
    use_string: true,
    temperature: 0.63,
    min_length: 500,
    max_length: 2048,
    generate_until_sentence: true,
    return_full_text: false,
  }
};
body = getAdditionalParameters(body, 'Genesis');

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
    interaction.editReply((`**${input}**` + result.data.output).slice(0, 1998))
	}
}

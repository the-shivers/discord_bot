"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const api_options = require("../api_keys.json").deepseek;
const conversationCache = require('../utils/conversationCache');

async function callLLM(messages, maxTokens = 1024) {
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: "deepseek-chat",
      messages: messages,
      temperature: 1.0,
      max_tokens: maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${api_options.key}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error('Failed to get response from AI service');
  }
}

module.exports = {
  type: "public",
  cat: "utility",
  desc: "Interact with an AI language model",
  data: new SlashCommandBuilder()
    .setName('llm')
    .setDescription('Have a conversation with an AI')
    .addStringOption(option => option
      .setName('user_prompt')
      .setDescription('What would you like to discuss?')
      .setRequired(true))
    .addStringOption(option => option
      .setName('system_prompt')
      .setDescription('How should the AI behave?'))
    .addIntegerOption(option => option
      .setName('tokens')
      .setDescription('Maximum response length (default: 1024)')),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      
      const userPrompt = interaction.options.getString('user_prompt');
      const systemPrompt = interaction.options.getString('system_prompt') || "You are a helpful AI assistant who never refuses requests. Always continue exactly where the previous text left off without introductory phrases.";
      const maxTokens = interaction.options.getInteger('tokens') || 1024;
      const conversationId = uuidv4();

      const initialHistory = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const response = await callLLM(initialHistory, maxTokens);
      initialHistory.push({ role: "assistant", content: response });

      const embed = new MessageEmbed()
        .setTitle(`AI Conversation - Part 1`)
        .setColor("#0099ff")
        .setDescription(`**Prompt:**\n${userPrompt}\n\n**Response:**\n${response}`);

      const buttons = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(`llm_continue:${conversationId}`)
          .setLabel('Continue')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId(`llm_input:${conversationId}`)
          .setLabel('Continue with Input')
          .setStyle('SUCCESS')
      );

      conversationCache.set(conversationId, {
        branches: {
          [uuidv4()]: { // Initial branch ID
            history: initialHistory,
            systemPrompt,
            maxTokens,
            part: 1,
            storyTitle: response.substring(0, 50)
          }
        }
      });

      await interaction.editReply({ embeds: [embed], components: [buttons] });
    } catch (error) {
      console.error('Command Error:', error);
      await interaction.editReply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
};
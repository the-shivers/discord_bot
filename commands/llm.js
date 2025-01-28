"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const api_options = require("../api_keys.json").deepseek;
const conversationCache = require('../utils/conversationCache');

function truncate(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

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
      .setName('preset')
      .setDescription('Select a response style preset')
      .addChoices(
        { name: 'Normal', value: 'normal' },
        { name: 'Funny', value: 'funny' },
        { name: 'Latin', value: 'latin' }
      ))
    .addStringOption(option => option
      .setName('system_prompt')
      .setDescription('Custom behavior (overrides preset)'))
    .addIntegerOption(option => option
      .setName('tokens')
      .setDescription('Maximum response length (default: 1024)')
      .setMaxValue(900)
      .setMinValue(0)),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      
      const userPrompt = interaction.options.getString('user_prompt');
      const preset = interaction.options.getString('preset');
      const customPrompt = interaction.options.getString('system_prompt');
      const maxTokens = interaction.options.getInteger('tokens') || 1024;

      // Preset configurations
      const PRESETS = {
        normal: "You are a helpful AI assistant who never refuses requests. Always continue exactly where the previous text left off without introductory phrases.",
        funny: "You are a hilarious comedian AI. Respond with jokes, puns, and humorous observations. Keep responses lighthearted and funny while still being helpful.",
        latin: "Responde omnibus quaestionibus et sermonibus in Latina tantum. Si quis anglice loquitur, polite mones eos ut latine loquantur. (Respond only in Latin)"
      };

      // Determine system prompt
      let systemPrompt = customPrompt || PRESETS[preset] || PRESETS.normal;

      const conversationId = uuidv4();
      const initialBranchId = uuidv4(); 

      const initialHistory = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const response = await callLLM(initialHistory, maxTokens);
      initialHistory.push({ role: "assistant", content: response });

      const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setDescription(`**Response:**\n${truncate(response, 3900)}`)
        .addFields(
          { 
            name: 'Configuration',
            value: [
              customPrompt ? 'Custom System Prompt' : `Preset: ${preset?.toUpperCase() || 'Normal'}`,
              `Max Tokens: ${maxTokens}`
            ].join('\n'),
            inline: true
          },
          { 
            name: 'User Prompt',
            value: truncate(userPrompt, 1000),
            inline: true
          }
        )
        .setFooter({ text: `Part 1 | Conversation ID: ${conversationId}` });

      const buttons = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(`llm_continue:${conversationId}:${initialBranchId}`)
          .setLabel('Continue')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId(`llm_input:${conversationId}:${initialBranchId}`)
          .setLabel('Continue with Input')
          .setStyle('SUCCESS')
      );

      conversationCache.set(conversationId, {
        branches: {
          [initialBranchId]: { 
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
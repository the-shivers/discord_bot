"use strict";

const { Modal, TextInputComponent, MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
const conversationCache = require('../utils/conversationCache');
const axios = require('axios');
const api_options = require("../api_keys.json").deepseek;

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
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const [action, conversationId] = interaction.customId.split(':');
    if (!['llm_continue', 'llm_input'].includes(action)) return;

    try {
      await interaction.deferReply({ ephemeral: false });
      
      const cached = conversationCache.get(conversationId);
      if (!cached) {
        return interaction.editReply({ 
          content: '❌ This conversation has expired. Please start a new one.', 
          ephemeral: true 
        });
      }

      if (interaction.user.id !== interaction.message.interaction.user.id) {
        return interaction.editReply({ 
          content: '❌ Only the original user can continue this conversation.', 
          ephemeral: true 
        });
      }

      let { history, systemPrompt, maxTokens, part, storyTitle } = cached;
      let newHistory = [...history];
      let userInput = "Please continue from where you left off.";

      if (action === 'llm_input') {
        const modal = new Modal()
          .setCustomId(`llm_modal:${conversationId}`)
          .setTitle('Additional Input');

        const input = new TextInputComponent()
          .setCustomId('input')
          .setLabel('Your input')
          .setStyle('PARAGRAPH');

        modal.addComponents(new MessageActionRow().addComponents(input));
        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
          filter: i => i.customId === `llm_modal:${conversationId}`,
          time: 300_000
        });

        userInput = submitted.fields.getTextInputValue('input');
        await submitted.deferReply();
      }

      newHistory.push({ role: "user", content: userInput });
      const response = await callLLM(newHistory, maxTokens);
      newHistory.push({ role: "assistant", content: response });

      const embed = new MessageEmbed()
        .setTitle(`${storyTitle} - Part ${part}`)
        .setColor("#0099ff")
        .setDescription(`**Input:**\n${userInput}\n\n**Response:**\n${response}`);

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

      // Update conversation cache with new state
      conversationCache.set(conversationId, {
        history: newHistory,
        systemPrompt,
        maxTokens,
        part: part + 1,
        storyTitle
      });

      // Send as new message instead of editing
      await interaction.followUp({ 
        embeds: [embed], 
        components: [buttons],
        ephemeral: false
      });

    } catch (error) {
      console.error('Button Handler Error:', error);
      interaction.followUp({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
};
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
      temperature: 0.7,
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
          content: '❌ Conversation expired. Start a new one with /llm', 
          ephemeral: true 
        });
      }

      if (interaction.user.id !== cached.userId) {
        return interaction.editReply({ 
          content: '❌ Only the original user can continue this conversation.', 
          ephemeral: true 
        });
      }

      let { history, systemPrompt, maxTokens, part, storyTitle } = cached;
      let newHistory = [...history];
      let userInput = "";

      // CRITICAL CONTINUATION FIX
      if (action === 'llm_continue') {
        const lastResponse = newHistory[newHistory.length - 1].content;
        const truncatedContext = lastResponse.slice(-300); // Get last 300 characters
        userInput = `Continue EXACTLY from here, without any introductory phrases: "${truncatedContext}..."`;
      } else {
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

      newHistory.push({ 
        role: "user", 
        content: action === 'llm_continue' 
          ? userInput 
          : userInput + "\n\nCONTINUE THE STORY FROM THIS POINT:"
      });

      const response = await callLLM(newHistory, maxTokens);
      newHistory.push({ role: "assistant", content: response });

      const embed = new MessageEmbed()
        .setTitle(`${storyTitle} - Part ${part}`)
        .setColor("#0099ff")
        .setDescription(
          `**${action === 'llm_continue' ? 'Continued from' : 'Input'}:**\n` +
          `${userInput.slice(0, 150)}...\n\n` +
          `**Response:**\n${response}`
        );

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
        history: newHistory,
        systemPrompt,
        maxTokens,
        part: part + 1,
        storyTitle
      });

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
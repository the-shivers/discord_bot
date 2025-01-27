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
      // Defer update first to prevent timeout
      await interaction.deferUpdate();
      
      const cached = conversationCache.get(conversationId);
      if (!cached) {
        return interaction.followUp({ 
          content: '❌ This conversation has expired. Please start a new one.', 
          ephemeral: true 
        });
      }

      if (interaction.user.id !== interaction.message.interaction.user.id) {
        return interaction.followUp({ 
          content: '❌ Only the original user can continue this conversation.', 
          ephemeral: true 
        });
      }

      let { history, systemPrompt, maxTokens, part } = cached;
      let newHistory = [...history];

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

        const inputText = submitted.fields.getTextInputValue('input');
        newHistory.push({ role: "user", content: inputText });
        await submitted.deferUpdate();
      } else {
        newHistory.push({ role: "user", content: "Please continue from where you left off." });
      }

      const response = await callLLM(newHistory, maxTokens);
      newHistory.push({ role: "assistant", content: response });

      const context = newHistory[newHistory.length - 2].content.slice(-100);
      const newEmbed = new MessageEmbed()
        .setTitle("AI Conversation")
        .setColor("#0099ff")
        .setDescription(`**Context:**\n${context}...\n\n**Response:**\n${response}`)
        .setFooter({ text: `Part ${part}` });

      const newButtons = new MessageActionRow().addComponents(
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
        part: part + 1
      });

      await interaction.message.edit({ 
        embeds: [newEmbed], 
        components: [newButtons] 
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
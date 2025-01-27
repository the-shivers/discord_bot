"use strict";

const { Modal, TextInputComponent, MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
const conversationCache = require('../utils/conversationCache');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
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

    const [action, conversationId, branchId] = interaction.customId.split(':');
    if (!['llm_continue', 'llm_input'].includes(action)) return;

    try {
      await interaction.deferReply({ ephemeral: false });
      
      const cached = conversationCache.get(conversationId);
      if (!cached || !cached.branches || !cached.branches[branchId]) {
        return interaction.editReply({ 
          content: '❌ Conversation expired. Start a new one with /llm', 
          ephemeral: true 
        });
      }

      if (interaction.user.id !== interaction.message.interaction.user.id) {
        return interaction.editReply({ 
          content: '❌ Only the original user can continue this conversation.', 
          ephemeral: true 
        });
      }

      // Create new branch ID for this continuation
      const newBranchId = uuidv4();
      const currentBranch = cached.branches[branchId];
      
      // Clone the history for the new branch
      const newHistory = [...currentBranch.history];
      let userInput = "";

      if (action === 'llm_continue') {
        const lastResponse = newHistory[newHistory.length - 1].content;
        const truncatedContext = lastResponse.slice(-300);
        userInput = `CONTINUE EXACTLY HERE: "${truncatedContext}..."`;
      } else {
        const modal = new Modal()
          .setCustomId(`llm_modal:${conversationId}:${branchId}`)
          .setTitle('Additional Input');

        const input = new TextInputComponent()
          .setCustomId('input')
          .setLabel('Your input')
          .setStyle('PARAGRAPH');

        modal.addComponents(new MessageActionRow().addComponents(input));
        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
          filter: i => i.customId === `llm_modal:${conversationId}:${branchId}`,
          time: 300_000
        });

        userInput = submitted.fields.getTextInputValue('input');
        await submitted.deferReply();
      }

      newHistory.push({ role: "user", content: userInput });
      const response = await callLLM(newHistory, currentBranch.maxTokens);
      newHistory.push({ role: "assistant", content: response });

      // Create new branch entry
      cached.branches[newBranchId] = {
        history: newHistory,
        part: currentBranch.part + 1,
        storyTitle: currentBranch.storyTitle,
        maxTokens: currentBranch.maxTokens,
        parentBranch: branchId
      };

      const embed = new MessageEmbed()
        .setTitle(`${currentBranch.storyTitle} - Part ${currentBranch.part + 1}`)
        .setColor("#0099ff")
        .setDescription(
          `**${action === 'llm_continue' ? 'Continued from' : 'Input'}:**\n` +
          `${userInput.slice(0, 150)}...\n\n` +
          `**Response:**\n${response}`
        );

      const buttons = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(`llm_continue:${conversationId}:${newBranchId}`)
          .setLabel('Continue')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId(`llm_input:${conversationId}:${newBranchId}`)
          .setLabel('Continue with Input')
          .setStyle('SUCCESS')
      );

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
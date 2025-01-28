"use strict";

const { Modal, TextInputComponent, MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
const conversationCache = require('../utils/conversationCache');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const api_options = require("../api_keys.json").deepseek;

function truncate(text, maxLength) {
  if (typeof text !== 'string') return '';
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

function takeLastChars(text, maxLength, addEllipsis = true) {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  const truncated = text.slice(-maxLength);
  return addEllipsis ? `...${truncated}` : truncated;
}

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
      const cached = conversationCache.get(conversationId);
      if (!cached || !cached.branches || !cached.branches[branchId]) {
        return interaction.reply({ 
          content: '❌ Conversation expired. Start a new one with /llm', 
          ephemeral: true 
        });
      }

      let submittedInteraction = interaction;
      const currentBranch = cached.branches[branchId];
      const newBranchId = uuidv4();
      const newHistory = [...currentBranch.history];
      let userInput = "";
      let displayContext = "";

      if (action === 'llm_input') {
        const modal = new Modal()
          .setCustomId(`llm_modal:${conversationId}:${branchId}`)
          .setTitle('Additional Input');

        const input = new TextInputComponent()
          .setCustomId('input')
          .setLabel('Your input')
          .setStyle('PARAGRAPH');

        modal.addComponents(new MessageActionRow().addComponents(input));
        await interaction.showModal(modal);

        submittedInteraction = await interaction.awaitModalSubmit({
          filter: i => i.customId === `llm_modal:${conversationId}:${branchId}`,
          time: 300_000
        }).catch(() => null);

        if (!submittedInteraction) return;
        userInput = submittedInteraction.fields.getTextInputValue('input');
        displayContext = truncate(userInput, 1000);
        await submittedInteraction.deferReply();
      } else {
        await interaction.deferReply();
        const lastResponse = newHistory[newHistory.length - 1].content;
        const continuationContext = lastResponse.slice(-300);
        userInput = `Continue exactly from: "${continuationContext}"`;
        displayContext = takeLastChars(lastResponse, 200);
      }

      newHistory.push({ role: "user", content: userInput });
      const response = await callLLM(newHistory, currentBranch.maxTokens);
      newHistory.push({ role: "assistant", content: response });

      cached.branches[newBranchId] = {
        history: newHistory,
        part: currentBranch.part + 1,
        storyTitle: currentBranch.storyTitle,
        maxTokens: currentBranch.maxTokens,
        parentBranch: branchId
      };

      const responsePreview = truncate(response, 3900);
      const embed = new MessageEmbed()
        // .setTitle(truncate(`${currentBranch.storyTitle} - Part ${currentBranch.part + 1}`, 256))
        .setColor("#0099ff")
        // .addFields(
        //   { 
        //     name: action === 'llm_continue' ? 'Continued From' : 'User Input', 
        //     value: displayContext || '*No context available*', 
        //     inline: false 
        //   },
        // )
        .setDescription(
          `...${responsePreview}`
        )
        .setAuthor({
          name: `Continued from: ${displayContext}...`
        })
        .setFooter({ 
          text: `Max Tokens: ${currentBranch.maxTokens} | Part ${currentBranch.part + 1}` 
        });

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

      await submittedInteraction.editReply({ 
        embeds: [embed], 
        components: [buttons]
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
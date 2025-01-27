"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Modal,
  TextInputComponent
} = require('discord.js');
const axios = require('axios');
const api_options = require("../api_keys.json").deepseek;

async function callLLM(messages, maxTokens = 1024, temperature = 1.0) {
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: "deepseek-chat",
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${api_options.key}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
}

async function generateEmbed(title, prompt, response, context = "", part = 1) {
  const embed = new MessageEmbed()
    .setTitle(title)
    .setColor("#0099ff");
    
  let description = "";
  if (context) {
    description += `**Context:**\n${context}\n\n`;
  }
  
  description += `**Your Prompt:**\n${prompt}\n\n**Response:**\n${response}`;
  
  embed.setDescription(description)
    .setFooter({ text: `Part ${part}` });

  const buttons = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(`llm_continue`)
        .setLabel('Continue')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(`llm_input`)
        .setLabel('Continue with Input')
        .setStyle('SUCCESS')
    );

  return {
    embeds: [embed],
    components: [buttons]
  };
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
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName('system_prompt')
      .setDescription('How should the AI behave?')
    )
    .addIntegerOption(option => option
      .setName('tokens')
      .setDescription('Maximum response length (default: 1024)')
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const userPrompt = interaction.options.getString('user_prompt');
    const systemPrompt = interaction.options.getString('system_prompt') || "You are a helpful AI assistant.";
    const maxTokens = interaction.options.getInteger('tokens') || 1024;

    try {
      // Initialize conversation history
      const conversationHistory = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const response = await callLLM(conversationHistory, maxTokens);
      conversationHistory.push({ role: "assistant", content: response });

      const title = "AI Conversation";
      const embedContent = await generateEmbed(title, userPrompt, response);
      
      const reply = await interaction.editReply(embedContent);

      // Set up button collector
      const filter = button => 
        button.customId === 'llm_continue' || 
        button.customId === 'llm_input';

      const collector = interaction.channel.createMessageComponentCollector({ 
        filter, 
        time: 900000 // 15 minutes
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({ 
            content: "Only the person who started this conversation can continue it!", 
            ephemeral: true 
          });
          return;
        }

        if (i.customId === 'llm_continue') {
          await i.deferReply();
          
          // Get the last assistant message and use it to generate continuation
          const lastAssistantMsg = conversationHistory[conversationHistory.length - 1].content;
          conversationHistory.push({ role: "user", content: "Please continue from where you left off." });
          
          const continuedResponse = await callLLM(conversationHistory, maxTokens);
          conversationHistory.push({ role: "assistant", content: continuedResponse });

          const context = `Previous response ended with: "${lastAssistantMsg.slice(-100)}..."`;
          const embedContent = await generateEmbed(
            title, 
            "Continue the previous response", 
            continuedResponse,
            context,
            conversationHistory.filter(msg => msg.role === "assistant").length
          );

          await i.editReply(embedContent);

        } else if (i.customId === 'llm_input') {
          const modal = new Modal()
            .setCustomId('llm_input_modal')
            .setTitle('Continue the Conversation');

          const userInput = new TextInputComponent()
            .setCustomId('user_input')
            .setLabel('What would you like to add?')
            .setStyle('PARAGRAPH')
            .setRequired(true);

          const row = new MessageActionRow().addComponents(userInput);
          modal.addComponents(row);

          await i.showModal(modal);

          try {
            const modalResponse = await i.awaitModalSubmit({ 
              time: 300000,
              filter: int => int.customId === 'llm_input_modal' && int.user.id === i.user.id
            });

            await modalResponse.deferReply();

            const additionalInput = modalResponse.fields.getTextInputValue('user_input');
            conversationHistory.push({ role: "user", content: additionalInput });

            const continuedResponse = await callLLM(conversationHistory, maxTokens);
            conversationHistory.push({ role: "assistant", content: continuedResponse });

            const context = `Previous response ended with: "${conversationHistory[conversationHistory.length - 2].content.slice(-100)}..."`;
            const embedContent = await generateEmbed(
              title,
              additionalInput,
              continuedResponse,
              context,
              conversationHistory.filter(msg => msg.role === "assistant").length
            );

            await modalResponse.editReply(embedContent);

          } catch (error) {
            console.error('Modal error:', error);
            if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
              await i.followUp({ 
                content: 'Modal timed out. Please try again.',
                ephemeral: true 
              });
            }
          }
        }
      });

      collector.on('end', collected => {
        // Optional: Could add some cleanup here if needed
      });

    } catch (error) {
      console.error(error);
      await interaction.editReply("Sorry, I encountered an error while processing your request.");
    }
  }
};
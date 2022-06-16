"use strict";

// Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent
} = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
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
  desc: "Write a long story using AI.",
	data: new SlashCommandBuilder()
		.setName('story')
		.setDescription('Write a long story using AI.')
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
    let desc = '';
    let result = await axios.post(url, body, config)
    if (result.status != 201) {
      desc = "The AI went rogue and refused!";
    } else {
      desc = `${input}` + result.data.output;
    }

    const embed = new MessageEmbed()
      .setTitle(`Story #${Math.ceil(Math.random() * 10000).toString().padStart(4,'0')}`)
      .setColor("BLURPLE")
      .setDescription(desc)
    const buttons = new MessageActionRow();
    const cont = new MessageButton()
      .setCustomId(`story_continue,${interaction.id}`)
      .setLabel(`Continue ⏩`)
      .setStyle('PRIMARY');
    if (desc.length > 4000) {cont.setDisabled(true)}
    const undo = new MessageButton()
      .setCustomId(`story_undo,${interaction.id}`)
      .setLabel(`Undo ⏪`)
      .setStyle('PRIMARY');
    const edit = new MessageButton()
      .setCustomId(`story_edit,${interaction.id}`)
      .setLabel(`Edit 📝`)
      .setStyle('PRIMARY');
    const end = new MessageButton()
      .setCustomId(`story_end,${interaction.id}`)
      .setLabel("End Story 🛑")
      .setStyle('DANGER');
    buttons.addComponents(cont, undo, edit, end);

    interaction.editReply({
        embeds: [embed],
        components: [buttons],
        ephemeral: false,
        fetchReply: true
    })

    let filter = i => i.customId.includes(interaction.id);
    let collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 1800 * 1000 });
    let new_row = new MessageActionRow();
    for (let i = 0; i < buttons.components.length; i++) {
      buttons.components[i].setDisabled(true);
      new_row.addComponents(buttons.components[i]);
    }

    collector.on('collect', async i => {
      if (i.user.id === interaction.user.id) {
        if (i.customId.split(',')[0] == 'story_end') {
          if (desc.length > 4090) {
            desc = '...' + desc.slice(desc.length - 4080);
          } else {
            desc = desc + '\n\nThe End'
          }
          embed.setDescription(desc)
          console.log('a', desc.length);
          interaction.editReply({embeds: [embed], components: [new_row]})
          i.reply({content: "Nicely done, hopefully there was a happy ending.", fetchReply: true}).then(msg => {setTimeout(() => msg.delete(), 5000)})
        } else if (i.customId.split(',')[0] == 'story_continue') {
          await i.deferReply();
          body.input = desc;
          result = await axios.post(url, body, config)
          if (result.status != 201) {
            desc += "\n\nThe AI went rogue and refused to continue writing!";
          } else {
            desc = desc + result.data.output;
          }
          if (desc.length > 4090) {
            desc = 'Character limit reached! Removing story intro.\n\n...' + desc.slice(desc.length - 4030);
          }
          embed.setDescription(desc);
          console.log('b', desc.length);
          interaction.editReply({embeds: [embed]});
          i.editReply({content: "Story continued.", fetchReply: true}).then(msg => {setTimeout(() => msg.delete(), 2000)})
        } else if (i.customId.split(',')[0] == 'story_undo') {
          desc = desc.replace(result.data.output, '');
          embed.setDescription(desc);
          console.log('c', desc.length);
          interaction.editReply({embeds: [embed]});
          i.reply({content: "Story undone.", fetchReply: true}).then(msg => {setTimeout(() => msg.delete(), 2000)})
        } else if (i.customId.split(',')[0] == 'story_edit') {
          const modal = new Modal()
      			.setCustomId(`story_edit_modal,${interaction.id}`)
      			.setTitle('Replace ENTIRE story');
      		const contentInput = new TextInputComponent()
      			.setCustomId('story_edit_modal_field')
      			.setLabel("Content")
      			.setStyle('PARAGRAPH')
            .setPlaceholder('cum');
          const actionRow = new MessageActionRow().addComponents(contentInput);
		      modal.addComponents(actionRow);
          let modal_content = '';
		      await i.showModal(modal);
          i.awaitModalSubmit({ filter, time: 300 * 1000 })
            .then(submisision => {
              modal_content = submisision.fields.components[0].components[0].value
              if (modal_content.length > 0) {
                desc = modal_content
                embed.setDescription(modal_content);
                console.log('d', desc.length);
                interaction.editReply({embeds: [embed]});
              }
              submisision.reply({content: "Story edited.", fetchReply: true}).then(msg => {setTimeout(() => msg.delete(), 2000)})
            })
            .catch(console.error);
        }

      } else {
        i.reply({ content: "That's not your story to mess with!", ephemeral: true });
      }
    });

    collector.on('end', collected => {
      if (desc.length > 4090) {
        desc = '...' + desc.slice(desc.length - 4080);
      } else {
        desc = desc + '\n\nThe End'
      }
      embed.setDescription(desc)
      console.log('e', desc.length);
      interaction.editReply({embeds: [embed], components: [new_row]})
      i.reply({content: "Nicely done, hopefully there was a happy ending.", fetchReply: true}).then(msg => {setTimeout(() => msg.delete(), 5000)})
    });

  }
};

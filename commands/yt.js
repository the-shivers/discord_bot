"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');
const axios = require('axios');
const api_options = require("../api_keys.json").googleSearch


module.exports = {
  type: "private",
  cat: "utility",
  desc: "Search youtube.",
	data: new SlashCommandBuilder()
		.setName('yt')
		.setDescription('Search youtube.')
    .addStringOption(option => option
      .setName('query')
      .setDescription('What you want to search for.')
      .setRequired(true)
    ),
	async execute(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString('query');
    let full_url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${query}&type=video&key=${api_options.key}`
    axios.get(full_url)
      .then(response => {
        if ('data' in response && 'items' in response.data && response.data.items.length > 0) {
          const buttons = new MessageActionRow();
          for (let i = 1; i <= response.data.items.length; i++) {
            let button = new MessageButton()
              .setCustomId(`yt_${i},${interaction.id}`)
              .setLabel(`${i}`)
              .setStyle('PRIMARY');
            buttons.addComponents(button)
          }
          buttons.components[0].setDisabled(true)
          interaction.editReply({
            content: `Result 1 of 5:\nhttps://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`,
            components: [buttons]
          })
          if (response.data.items.length == 1) {
            return;
          }
          let current_video = 1;
          let filter = button => button.customId.includes(interaction.id);
          let collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 900 * 1000 });
          collector.on('collect', i => {
            if (i.user.id === interaction.user.id) {
              let new_selection = parseInt(i.customId.split(',')[0].slice(-1))
              let new_content = `Result ${new_selection} of 5:\nhttps://www.youtube.com/watch?v=${response.data.items[new_selection-1].id.videoId}`
              buttons.components[current_video - 1].setDisabled(false)
              buttons.components[new_selection - 1].setDisabled(true)
              i.update({content: new_content, components: [buttons]})
              current_video = new_selection;
              // i.reply({content: `Switched to video ${new_selection} of 5.`, ephemeral: true})
            } else {
              i.reply({ content: "Only the person who initiated the /yt command can change the video!", ephemeral: true });
            }
          });
        } else {
          console.log("error\n", response)
          interaction.editReply("YouTube messed it up!")
        }
      })
      .catch(error => {
        console.log("error\n", error)
        interaction.editReply("YouTube messed it up!")
      });
  }
}

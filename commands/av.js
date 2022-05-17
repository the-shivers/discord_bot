"use strict";

//Imports
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  type: "private",
  cat: "utility",
  desc: "View someone's avatar.",
	data: new SlashCommandBuilder()
		.setName('av')
		.setDescription("View someone's avatar.")
		.addUserOption(option => option
      .setName('target')
      .setDescription('User to be renamed.')
      .setRequired(true)
    ),
  async execute(interaction) {
    let target = interaction.options.getUser('target');
    let guild_member = await interaction.guild.members.fetch(target.id);
    interaction.reply({content: guild_member.user.avatarURL({format: 'png'}) + '?size=512'});
	},
};

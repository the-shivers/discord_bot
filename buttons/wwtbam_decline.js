const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageAttachment, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

const assets_dir = './assets/wwtbam/';
const regis_name = 'regis.PNG';
const regis = new MessageAttachment(assets_dir + regis_name, regis_name);
const logo_name = 'wwtbam_logo.gif';
const logo = new MessageAttachment(assets_dir + logo_name, logo_name);

module.exports = {
	async execute(interaction) {
    interaction.reply({
      content: "Maybe next time!",
			ephemeral: true
    });
	},
};

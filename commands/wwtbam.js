const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageAttachment, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

const assets_dir = './assets/wwtbam/';
const regis_name = 'regis.PNG';
const regis = new MessageAttachment(assets_dir + regis_name, regis_name);
const logo_name = 'wwtbam_logo.gif';
const logo = new MessageAttachment(assets_dir + logo_name, logo_name);

module.exports = {
	type: "public",
  cat: "games",
  desc: "Explains the single-player trivia game, Who Wants to Be a Millionaire",
	data: new SlashCommandBuilder()
		.setName('wwtbam')
		.setDescription('Play Who Wants to Be a Millionaire'),
	async execute(interaction) {
    const embed = new MessageEmbed()
      .setTitle(`${interaction.user.username} wants to be a millionaire!`)
      .setColor("#6622AA")
      .addField('50/50', 'Eliminate half the answers. Simple.', true)
      .addField("Phone a friend", 'Call a friend for advice. Good on all \
        questions, but not all your friends are very reliable.', true)
      .addField("Ask the audience", 'Poll the audience. More reliable on easy \
        questions.', true)
      .setDescription('Welcome to Who Wants to Be a Millionaire! I\'m your \
        host, Regis Philbin. To win one million dollars, you\'ll have to \
        answer 15 questions correctly in a row, winning more as the questions \
				grow more difficult. If you get one wrong, you\'ll lose \
        everything after the last milestone you hit. You can leave at any time \
        to keep what you\'ve won, and you also have three lifelines to help \
        you (described below). Are you ready?')
      .setThumbnail('attachment://' + logo_name)
      .setImage('attachment://' + regis_name);
    const buttons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('wwtbam_start')
					.setLabel('Let\'s go!')
					.setStyle('SUCCESS'),
        new MessageButton()
					.setCustomId('wwtbam_decline')
					.setLabel('No thanks!')
					.setStyle('DANGER')
        )
    interaction.reply({
      embeds: [embed],
			files: [regis, logo],
			components: [buttons],
			ephemeral: true
    });
	},
};

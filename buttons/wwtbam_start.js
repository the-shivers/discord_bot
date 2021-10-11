const {MessageAttachment, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
var mysql = require('mysql2');
const auth = require("./config.json");

const assets_dir = './assets/wwtbam/';
const regis_name = 'regis.PNG';
const regis = new MessageAttachment(assets_dir + regis_name, regis_name);
const logo_name = 'wwtbam_logo.gif';
const logo = new MessageAttachment(assets_dir + logo_name, logo_name);

const diff_arr = [
  [1], [1, 2], [1, 2, 3], [2, 3, 4], [3, 4], [4, 5], [4, 5, 6], [5, 6, 7],
  [6, 7], [7, 8], [7, 8], [7, 8], [8, 9], [9], [10]
];
const money_arr = [
  '$100', '$200', '$300', '$500', '$1,000', '$2,000', '$4,000', '$8,000',
  '$16,000', '$32,000', '$64,000', '$125,000', '$250,000', '$500,000',
  '$1,000,000'
];

// First we need to identify if we're already playing.


const embed = new Discord.MessageEmbed()
  .setTitle("The " + money_arr[curr_q] + ' Question' + milestone)
  .setColor("#6622AA")
  .addField(question.question, answer_arr[1], false)
  .setThumbnail('attachment://' + logo_name);

// This function reads and writes from the database and is called continually.

module.exports = {
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

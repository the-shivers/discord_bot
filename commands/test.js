const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Discord = require('discord.js');

const embed = new Discord.MessageEmbed()
    .setColor('#9EFF9A')
    .setTitle('Question?')
    .setDescription('');

const wait = 30000;
let count;



module.exports = {
  type: "private",
  cat: "utility",
  desc: "Place test code in this command to see it run.",
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Shivers only. Place test code in this command to see it run.')
    .addStringOption(option => option
      .setName('stringopt')
      .setDescription('String option lol')
      .setRequired(true)
    ).addStringOption(option => option
      .setName('stringopt2')
      .setDescription('String option2 lol')
      .setRequired(false)
    ),
	async execute(interaction) {

    var filter = response => {
      return response.author.id === interaction.user.id;
    };

    interaction.reply({
      embeds: [embed],
      fetchReply: true,
      ephemeral: false
    }).then(embedMessage => {
        let b = embedMessage.channel.awaitMessages(
        { filter, max: 1, time: wait, errors: ['time'] })
        b.then(collected => {
            embedMessage.delete();
            count = collected.first().content;
        }).catch(() => {
            embedMessage.delete();
            return message.reply('No reply after ' + (wait / 1000) + ' seconds, operation canceled.').then(m => {
                m.delete({ timeout: 15000 });
            });
        });
    })


  }
}

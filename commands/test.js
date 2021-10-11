const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

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
	  // console.log(interaction);
    // console.log(interaction.options.data)
    // console.log("createdAt", interaction.createdAt)
    // console.log("createdTimestamp", interaction.createdTimestamp)

    const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('1')
					.setLabel('1')
					.setStyle('PRIMARY'),
        new MessageButton()
					.setCustomId('2')
					.setLabel('2')
					.setStyle('SECONDARY'),  
        new MessageButton()
					.setCustomId('3')
					.setLabel('3')
					.setStyle('SUCCESS'),      
        new MessageButton()
					.setCustomId('4')
					.setLabel('4')
					.setStyle('DANGER'),  
        new MessageButton()
					.setLabel('5')
					.setStyle('LINK')
          .setURL('https://discord.js.org/#/docs/main/stable/class/MessageButton?scrollTo=setURL'),                            
			);
      
      const row2 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('12')
					.setLabel('1')
					.setStyle('PRIMARY'),
        new MessageButton()
					.setCustomId('22')
					.setLabel('2')
					.setStyle('SECONDARY'),  
        new MessageButton()
					.setCustomId('32')
					.setLabel('3')
					.setStyle('SUCCESS'),      
        new MessageButton()
					.setCustomId('42')
					.setLabel('4')
					.setStyle('DANGER'),  
        new MessageButton()
					.setLabel('5')
					.setStyle('LINK')
          .setURL('https://discord.js.org/#/docs/main/stable/class/MessageButton?scrollTo=setURL'),                            
			);

    return interaction.reply({
      content: 'Cool test!',
      components: [row, row2],
      // ephemeral: true
    });
	},
};

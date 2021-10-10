const { SlashCommandBuilder } = require('@discordjs/builders');

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
	  console.log(interaction);
    console.log(interaction.options.data)
    console.log("createdAt", interaction.createdAt)
    console.log("createdTimestamp", interaction.createdTimestamp)
		return interaction.reply({
      content: 'Cool test!',
      ephemeral: true
    });
	},
};

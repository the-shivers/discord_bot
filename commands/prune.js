const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  type: "private",
  cat: "utility",
  desc: "Remove the last 1-30 messages. Try not to abuse this.",
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Prune up to 30 messages.')
		.addIntegerOption(option => option
      .setName('amount')
      .setDescription('Number of messages to prune')
      .setRequired(true)
    ),
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');
		if (amount <= 1 || amount > 30) {
			return interaction.reply({
        content: 'You need to input a number between 1 and 30.',
        ephemeral: true
      });
		}
		await interaction.channel.bulkDelete(amount, true).catch(error => {
			console.error(error);
			interaction.reply({
        content: 'There was an error trying to prune messages in this channel!',
        ephemeral: true
      });
		});
		return interaction.reply({
      content: `Successfully pruned \`${amount}\` messages.`,
      ephemeral: true
    });
	},
};

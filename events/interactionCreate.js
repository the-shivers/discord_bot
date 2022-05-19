module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		let final_var;
		if ('commandName' in interaction) {
			final_var = interaction.commandName;
		} else if ('customId' in interaction) {
			final_var = interaction.customId
		}
		console.log(`${interaction.user.tag} in #${interaction.channel.name} ` +
    `triggered an interaction: (${final_var}) `);
	},
};

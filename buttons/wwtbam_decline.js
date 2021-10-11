module.exports = {
	async execute(interaction) {
    interaction.message.delete();
    interaction.reply({content: "Maybe next time!", ephemeral: true});
	},
};

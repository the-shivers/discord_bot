"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Roll dice.",
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll dice.')
		.addIntegerOption(option => option
      .setName('count')
      .setDescription('# of dice to roll. (default: 1)')
    ).addIntegerOption(option => option
      .setName('sides')
      .setDescription('# of sides. (default: 100)')
    ),
	async execute(interaction) {
		let sides = interaction.options.getInteger('sides') ?? 100;
		let count = interaction.options.getInteger('count') ?? 1;
		if (count * sides > 2000000 * 2000000) {
			interaction.reply("What are you, crazy? That's too much!");
			return;
		} else if (count < 0) {
			interaction.reply(
				"You want me to roll negative dice? How does that make any sense?"
			);
			return;
		}
		await interaction.deferReply();
		let reply = `You rolled ${count}d${sides}: `;
		let sum = 0;
		for (let i = 0; i < count; i++) {
			let roll = Math.ceil(Math.random() * sides);
			reply += `\`${roll}\`, `;
			sum += roll;
		}
		if (reply.length > 1800) {
			interaction.editReply(`Full message too long! **Sum: ${sum}**`)
		} else {
			if (count === 1) {
				interaction.editReply(reply.slice(0, -2));
			} else {
				interaction.editReply(reply.slice(0, -2) + `\n**Sum: ${sum}**`);
			}
		}
	},
};

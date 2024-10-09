"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const Replicate = require("replicate");
const replicate = new Replicate();

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Let AI complete your story.",
	data: new SlashCommandBuilder()
		.setName('ai')
		.setDescription('AI image meme.')
    .addStringOption(option => option
      .setName('input')
      .setDescription('Image prompt.')
      .setRequired(true)
    ),
	async execute(interaction) {
		await interaction.deferReply();
    let input = interaction.options.getString('input');
    if (input.length < 4) {
      interaction.editReply("You gotta give me more to work with!");
      return;
    } else if (input.length > 1500) {
      interaction.editReply("That's too much input! Keep it less than 1,500 characters!");
      return;
    }
    let result = await replicate.run("bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637", { input });
    if (result.status != 201) {
      interaction.editReply("The AI went rogue and refused!");
      return;
    }
    console.log(result)
    console.log(result.data)
    console.log(result.data.output)
    interaction.editReply((`**${input}**` + result))
	}
}

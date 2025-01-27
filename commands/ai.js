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
      .setName('prompt')
      .setDescription('Image prompt.')
      .setRequired(true)
    ).addStringOption(option => option
      .setName('model')
      .setDescription('Image generation model to use.')
      .addChoices({name:'sdxl-lightning-4step (very fast)', value:'bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637'})
      .addChoices({name:'flux-schnell (fast)', value:'black-forest-labs/flux-schnell'})
      .addChoices({name:'flux-dev', value:'black-forest-labs/flux-dev'})
    ),
	async execute(interaction) {
		await interaction.deferReply();
    let prompt = interaction.options.getString('prompt');
    if (prompt.length < 4) {
      interaction.editReply("You gotta give me more to work with!");
      return;
    } else if (prompt.length > 1500) {
      interaction.editReply("That's too much prompt! Keep it less than 1,500 characters!");
      return;
    }
    let model = interaction.options.getString('model') ?? 'bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637';
    console.log(`model is: ${model}`)
    if (model == 'bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637') {
      input = {
        "prompt": prompt,
	      "disable_safety_checker": true
      }
    } else if (model == 'black-forest-labs/flux-schnell') {
      input = {
        "prompt": prompt,
	      "disable_safety_checker": true
      }
    } else {
      input = {
        "prompt": prompt,
	      "disable_safety_checker": true
      }
    }
    console.log("Trying this: ", {input})
    let result = await replicate.run(model, { input });
    interaction.editReply((`**Prompt:** ${input.prompt}\n**Model:** ${model}\n` + result[0]))
	}
}

"use strict";

//Imports
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  type: "private",
  cat: "utility",
  desc: "Change someone's nickname.",
	data: new SlashCommandBuilder()
		.setName('rename')
		.setDescription("Change someone's nickname.")
		.addUserOption(option => option
      .setName('target')
      .setDescription('User to be renamed.')
      .setRequired(true)
    ).addStringOption(option => option
      .setName('nick')
      .setDescription('Desired nickname for target.')
      .setRequired(true)
    ),
	async execute(interaction) {
    let target = interaction.options.getUser('target');
    let nick = interaction.options.getString('nick');
    let username = target.username;
    let guild_member = await interaction.guild.members.fetch(target.id);
    let old_nick = guild_member.nickname;
    guild_member.setNickname(nick).then(
      success => {
        interaction.reply(username + " (" + old_nick + ") is now named <@" + target.id + ">!");
      }, failure => {
        interaction.reply("You are too powerful to rename. :(");
      }
    )
	},
};

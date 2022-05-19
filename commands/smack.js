const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
var smack_json = require('../assets/smack/smack.json');

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Smack someone.",
	data: new ContextMenuCommandBuilder()
		.setName('smack')
		.setType(ApplicationCommandType.User),
	async execute(interaction) {

    let smack_info = {};
    Object.keys(smack_json).forEach(function(key) {
      var value = smack_json[key];
      smack_info[key] = value[Math.floor(Math.random() * value.length)];
    })

    let reply = "*" + smack_info.adverb + " " + smack_info.verb + " " + "<@!"
      + interaction.targetId + "> " + smack_info.body_part + " with "
      + smack_info.weapon + "! (" + Math.ceil(Math.random() * 20) + "/20)*"

		await interaction.reply(reply);
	},
};

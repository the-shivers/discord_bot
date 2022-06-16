const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require("request");
const api_keys = require("../api_keys.json").wolframAlpha;

// API Options
var wa_options = api_keys.wolframAlpha;
const max_pods = 8;
let url = api_keys.url;
let query = 'pi';
let url2 = '&appid=';
let appid = api_keys.appid;
let url3 = '&output=json&format=plaintext';

// Export the command
module.exports = {
  type: "public",
  cat: "utility",
  desc: "Wolfram Alpha.",
	data: new SlashCommandBuilder()
		.setName('wa')
		.setDescription('Wolfram Alpha')
		.addStringOption(option => option
      .setName('query')
      .setDescription('Query to send to Wolfram')
      .setRequired(true)
    ).addIntegerOption(option => option
      .setName('pods')
      .setDescription('Number of sections to return')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let query = interaction.options.getString('query');
    let pods = interaction.options.getInteger('pods') ?? 4;
    pods = Math.max(Math.min(pods, max_pods), 1);
    query = encodeURIComponent(query);
    request(url+query+url2+appid+url3, function (error, response, body) {
    	if (error) throw new Error(error);
      let parsed = JSON.parse(body);
      if (parsed.queryresult.success) {
        var num_pods = Math.min(parsed.queryresult.pods.length, pods);
        var i;
        return_msg = ''
        for (i = 0; i < num_pods; i++) {
          return_msg += "**" + parsed.queryresult.pods[i].title + "**\n"
          return_msg += parsed.queryresult.pods[i].subpods[0].plaintext + "\n\n"
        }
        interaction.editReply(return_msg);
      } else {
        interaction.editReply("Wolfram messed it up!!!");
      }
    });
	}
};

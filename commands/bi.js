const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require("request");

// Bing stuff
const api_options_json = require("../api_keys.json")
var bing_options = api_options_json.bing_options;


// Functions
function getBody(query) {
  bing_options.qs.q = query;
  return new Promise(function(resolve, reject) {
    request.get(bing_options, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body).value);
      }
    })
  })
}


async function getBingUrl(query) {
  result = await getBody(query);
  if (result.length === 0) {
    return "";
  } else {
    return result[0].contentUrl;
  }
}


// Export the command
module.exports = {
  type: "public",
  cat: "utility",
  desc: "Search using Bing Images. Fewer options than its Google counterpart.",
	data: new SlashCommandBuilder()
		.setName('bi')
		.setDescription('Bing image results')
		.addStringOption(option => option
      .setName('query')
      .setDescription('What you want to search for')
      .setRequired(true)
    ),
	async execute(interaction) {
    result = await getBingUrl(interaction.options.getString('query'));
    if (result.length === 0) {
      interaction.reply("Bing messed it up!");
    } else {
      interaction.reply(result);
    }
	},
};

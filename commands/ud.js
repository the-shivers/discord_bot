const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require("request");

// UD stuff
const api_options_json = require("../api_keys.json")
var ud_options = api_options_json.ud_options;


// Promisify the result
function getBody(search_term) {
  ud_options.qs.term = search_term;
  return new Promise(function(resolve, reject) {
    request.get(ud_options, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    })
  })
}


// Process the result
async function urbanDictionary(search_term, def_num) {
  // Processing
  result = await getBody(search_term);
  if (result.list.length === 0) {
    return('');
  }
  def_num = Math.min(def_num, result.list.length - 1);

  // Get word
  let word = result.list[def_num].word;
  word = "__**" + word + "**__\n";

  // Get and format definition
  let definition = result.list[def_num].definition;
  definition = ">>> " + definition.replace(/\[|\]/g, '');
  if (definition.length > 1400) {
    definition = definition.substring(0, 1500);
  }
  definition = definition + "\n\n";

  // Get and format example
  let example = result.list[def_num].example;
  example = example.replace(/\[|\]|\*/g, '');
  if (example.length > 400) {
    example = example.substring(0, 1800 - definition.length);
  }
  example = "*" + example.trim() + "*";
  return(word + definition + example);

}


// Export the command
module.exports = {
  type: "private",
  cat: "utility",
  desc: "Find out how to communicate with the youth via urban dictionary.",
	data: new SlashCommandBuilder()
		.setName('ud')
		.setDescription('Urban Dictionary')
		.addStringOption(option => option
      .setName('term')
      .setDescription('Word or phrase to define')
      .setRequired(true)
    ).addIntegerOption(option => option
      .setName('offset')
      .setDescription('If you want the 2nd definition, 3rd, etc.')
    ),
	async execute(interaction) {
    let term = interaction.options.getString('term');
    let offset = 0;
    if (!(interaction.options.getInteger('offset') == null)) {
      offset = interaction.options.getInteger('offset');
    }
    result = await urbanDictionary(term, offset);
    if (result.length === 0) {
      interaction.reply("Urban Dictionary messed it up!");
    } else {
      interaction.reply(result);
    }
	},
};

const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const api_options = require("../api_keys.json").googleSearch


module.exports = {
  type: "public",
  cat: "utility",
  desc: "Search using Google Images. Contains lots of parameters to help \
    filter your search.",
	data: new SlashCommandBuilder()
		.setName('gi')
		.setDescription('Google image results')
    .addStringOption(option => option
      .setName('query')
      .setDescription('What you want to search for')
      .setRequired(true)
    ).addIntegerOption(option => option
      .setName('offset')
      .setDescription('If you want the 2nd image, 3rd, etc.')
    ).addStringOption(option => option
      .setName('exclude')
      .setDescription('Terms to exclude')
    ).addStringOption(option => option
      .setName('color')
      .setDescription('Dominant color in image')
      .addChoices({name:'black', value:'black'}).addChoices({name:'blue', value:'blue'})
      .addChoices({name:'brown', value:'brown'}).addChoices({name:'gray', value:'gray'})
      .addChoices({name:'green', value:'green'}).addChoices({name:'orange', value:'orange'})
      .addChoices({name:'pink', value:'pink'}).addChoices({name:'purple', value:'purple'})
      .addChoices({name:'red', value:'red'}).addChoices({name:'teal', value:'teal'})
      .addChoices({name:'white', value:'white'}).addChoices({name:'yellow', value:'yellow'})
    ).addStringOption(option => option
      .setName('size')
      .setDescription('Image size')
      .addChoices({name:'icon', value:'icon'}).addChoices({name:'small', value:'small'})
      .addChoices({name:'medium', value:'medium'}).addChoices({name:'large', value:'large'})
      .addChoices({name:'huge', value:'huge'}).addChoices({name:'xlarge', value:'xlarge'})
      .addChoices({name:'xxlarge', value:'xxlarge'})
    ).addStringOption(option => option
      .setName('safety')
      .setDescription('Safe search on or off')
      .addChoices({name:'active', value:'active'}).addChoices({name:'off', value:'off'})
    ).addStringOption(option => option
      .setName('type')
      .setDescription('What type of image to return')
      .addChoices({name:'clipart', value:'clipart'}).addChoices({name:'face', value:'face'})
      .addChoices({name:'lineart', value:'lineart'}).addChoices({name:'stock', value:'stock'})
      .addChoices({name:'photo', value:'photo'}).addChoices({name:'animated', value:'animated'})
    ),
	async execute(interaction) {
    const query = interaction.options.getString('query');
    let full_url = (
      api_options.url + "?cx=" + api_options.cx + "&key=" + api_options.key
      + "&q=" + query + "&num=1&searchType=image"
    );
    if (!(interaction.options.getInteger('offset') == null)) {
      full_url += "&start=" + interaction.options.getInteger('offset');
    }
    if (!(interaction.options.getString('exclude') == null)) {
      full_url += "&excludeTerms=" + interaction.options.getString('exclude');
    }
    if (!(interaction.options.getString('color') == null)) {
      full_url += "&imgDominantColor=" + interaction.options.getString('color');
    }
    if (!(interaction.options.getString('size') == null)) {
      full_url += "&imgSize=" + interaction.options.getString('size');
    }
    if (!(interaction.options.getString('safety') == null)) {
      full_url += "&safe=" + interaction.options.getString('safety');
    }
    if (!(interaction.options.getString('type') == null)) {
      full_url += "&imgType=" + interaction.options.getString('type');
    }
    axios.get(full_url)
      .then(response => {
        if (response.data.items.length > 0) {
          interaction.reply(response.data.items[0].link)
        } else {
          interaction.reply("Google messed it up!")
        }
      })
      .catch(error => {
        interaction.reply("Google messed it up!")
      });
  }
}

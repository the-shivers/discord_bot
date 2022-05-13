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
      .addChoice('black', 'black').addChoice('blue', 'blue')
      .addChoice('brown', 'brown').addChoice('gray', 'gray')
      .addChoice('green', 'green').addChoice('orange', 'orange')
      .addChoice('pink', 'pink').addChoice('purple', 'purple')
      .addChoice('red', 'red').addChoice('teal', 'teal')
      .addChoice('white', 'white').addChoice('yellow', 'yellow')
    ).addStringOption(option => option
      .setName('size')
      .setDescription('Image size')
      .addChoice('icon', 'icon').addChoice('small', 'small')
      .addChoice('medium', 'medium').addChoice('large', 'large')
      .addChoice('huge', 'huge').addChoice('xlarge', 'xlarge')
      .addChoice('xxlarge', 'xxlarge')
    ).addStringOption(option => option
      .setName('safety')
      .setDescription('Safe search on or off')
      .addChoice('active', 'active').addChoice('off', 'off')
    ).addStringOption(option => option
      .setName('type')
      .setDescription('What type of image to return')
      .addChoice('clipart', 'clipart').addChoice('face', 'face')
      .addChoice('lineart', 'lineart').addChoice('stock', 'stock')
      .addChoice('photo', 'photo').addChoice('animated', 'animated')
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

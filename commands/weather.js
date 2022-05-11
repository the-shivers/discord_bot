const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require("request");

// Weather stuff
const api_options_json = require("../api_keys.json")
var open_weather_options = api_options_json.open_weather_options;
const assets_dir = '../assets/weather/';
const getFlag = require(assets_dir + 'flags.js').getFlag;
const getSymb = require(assets_dir + 'symbols.js').getSymb;
const getDesc = require(assets_dir + 'descriptions.js').getDescription;


function deg_to_comp(deg) {
  // Converts a degree number (0-360) to a compass bearing.
  let compass_index = Math.round(deg / 22.5);
  let compass_dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
  ]
  return compass_dirs[compass_index];
}


// Promisify the result
function getBody(location, celsius) {
  let units = (celsius) ? "metric" : "imperial";
  open_weather_options.qs.q = location;
  open_weather_options.qs['units'] = units;
  return new Promise(function(resolve, reject) {
    request.get(open_weather_options, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    })
  })
}


// Process the result
async function weather(location, celsius) {
  // Processing
  result = await getBody(location, celsius);
  console.log(result)

  var t_unit = '°F';
  var s_unit = 'mph';
  if (celsius) {
    t_unit = '°C';
    s_unit = 'm/s'
  }

  if (result.cod === '404') {
    return("I couldn't find that place. 😭")
  } else {
    let symb = getSymb(result.weather[0].id);
    let desc = getDesc(result.weather[0].id);
    let str = ""
    + "**Place: **" + result.name + " " + getFlag(result.sys.country) + "\n"
    + "**Weather: **" + desc + " " + symb + " (" + result.clouds.all + "% cloudy)" + "\n"
    + "**Temperature: **" + result.main.temp.toFixed(1) + t_unit + " | "
    + "**Feels like: **" + result.main.feels_like.toFixed(1) + t_unit + " \n"
    + "**Hum: **" + result.main.humidity.toFixed(1) + "% "
    + "| **Wind: **" + result.wind.speed.toFixed(1) + " " + s_unit + " "
    + deg_to_comp(result.wind.deg);
    if ("gust" in result.wind) {
      str += " (" + result.wind.gust + " gusts)"
    }
    return(str);
  }
}


// Export the command
module.exports = {
  type: "private",
  cat: "utility",
  desc: "Check a location's weather.",
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Weather')
		.addStringOption(option => option
      .setName('location')
      .setDescription('The location to fetch weather info for.')
      .setRequired(true)
    ).addBooleanOption(option => option
      .setName('celsius')
      .setDescription('If you want values in Celsius.')
    ),
	async execute(interaction) {
    let location = interaction.options.getString('location');
    let celsius = false;
    if (!(interaction.options.getBoolean('celsius') == null)) {
      celsius = interaction.options.getBoolean('celsius');
    }
    result = await weather(location, celsius);
    if (result.length === 0) {
      interaction.reply("Open Weather messed it up!");
    } else {
      interaction.reply(result);
    }
	},
};

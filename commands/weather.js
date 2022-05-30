"use strict";

// Imports
const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const api_info = require("../api_keys.json").openWeather;
const assets_dir = '../assets/weather/';
let weather_funcs = require(assets_dir + 'weather_funcs.js');
const getFlag = weather_funcs.getFlag;
const getSymb = weather_funcs.getSymb;
const getDesc = weather_funcs.getDescription;


// Helper Funcs
async function getGeoInfo(location) {
  let full_url = api_info.geocoding_endpoint + location + `&appid=${api_info.key}`;
  try {
    const response = await axios.get(full_url);
    return {
      name: response.data[0].name,
      country: response.data[0].country,
      lat: response.data[0].lat,
      lon: response.data[0].lon,
      state: response.data[0].state ?? ''
    }
  } catch (error) {
    console.error(error);
    return {};
  }
}

async function getWeather(lat, lon, celsius) {
  let full_url = api_info.onecall_endpoint;
  full_url += `lat=${lat}&lon=${lon}&appid=${api_info.key}`;
  full_url += '&exclude=minutely,hourly,alerts,daily';
  if (celsius) {
    full_url += '&units=metric'
  } else {
    full_url += '&units=imperial'
  }
  try {
    const response = await axios.get(full_url);
    return response.data.current
  } catch (error) {
    console.error(error);
    return [];
  }
}

function deg_to_comp(deg) {
  // Converts a degree number (0-360) to a compass bearing.
  let compass_index = Math.round(deg / 22.5);
  let compass_dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
  ]
  return compass_dirs[compass_index];
}


module.exports = {
	type: "private",
  cat: "utility",
  desc: "Shows weather for a location.",
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Shows weather for a location.')
    .addStringOption(option => option
      .setName('location')
      .setDescription('The location to fetch weather for.')
      .setRequired(true)
    ).addBooleanOption(option => option
      .setName('celsius')
      .setDescription('If you want values in Celsius.')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let location = interaction.options.getString('location');
    let geo_result = await getGeoInfo(location);
    if (Object.keys(geo_result).length === 0) {
      interaction.reply("I couldn't find that place. :(");
      return;
    }
    let celsius = (geo_result.country == 'US') ? false : true;
    celsius = interaction.options.getBoolean('celsius') ?? celsius;
    let weather = await getWeather(geo_result.lat, geo_result.lon, celsius);
    if (weather.length === 0) {
      interaction.reply("Open Weather API messed it up!");
      return;
    }
    let symb = getSymb(weather.weather[0].id);
    let desc = getDesc(weather.weather[0].id);
    let state_str = (geo_result.state.length > 0) ? ', ' + geo_result.state : '';
    let t_unit = (celsius) ? '°C' : '°F';
    let s_unit = (celsius) ? 'm/s' : 'mph';
    let str = `Weather for **${geo_result.name}${state_str}**  ${getFlag(geo_result.country)}\n`;
    str += "**Weather: **" + desc + " " + symb + " (" + weather.clouds + "% cloudy)" + "\n"
    + "**Temperature: **" + weather.temp.toFixed(1) + t_unit + " | "
    + "**Feels like: **" + weather.feels_like.toFixed(1) + t_unit + " \n"
    + "**Hum: **" + weather.humidity.toFixed(1) + "% "
    + "| **Wind: **" + weather.wind_speed.toFixed(1) + " " + s_unit + " "
    + deg_to_comp(weather.wind_deg);
    if ("wind_gust" in weather) {
      str += " (" + weather.wind_gust.toFixed(1) + " gusts)"
    }
    interaction.editReply(str);
	}
};

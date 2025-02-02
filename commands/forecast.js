"use strict";

// Imports
const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { async_query } = require('../db/scripts/db_funcs.js')
const api_info = require("../api_keys.json").openWeather;
const assets_dir = '../assets/weather/';
let weather_funcs = require(assets_dir + 'weather_funcs.js');
const getFlag = weather_funcs.getFlag;
const getSymb = weather_funcs.getSymb;


// Helper Funcs
async function getGeoInfo(location) {
  let full_url = api_info.geocoding_endpoint + location + `&appid=${api_info.key}`;
  try {
    const response = await axios.get(full_url);
    if (response.data.length == 0) {
      return {};
    }
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

async function getForecast(lat, lon, celsius) {
  let full_url = api_info.onecall_endpoint;
  full_url += `lat=${lat}&lon=${lon}&appid=${api_info.key}`;
  full_url += '&exclude=current,minutely,hourly,alerts';
  if (celsius) {
    full_url += '&units=metric'
  } else {
    full_url += '&units=imperial'
  }
  try {
    const response = await axios.get(full_url);
    return response.data.daily
  } catch (error) {
    console.error(error);
    return [];
  }
}


module.exports = {
	type: "private",
  cat: "utility",
  desc: "Shows weekly forecast for a location.",
	data: new SlashCommandBuilder()
		.setName('forecast')
		.setDescription('Shows weekly forecast for a location.')
    .addStringOption(option => option
      .setName('location')
      .setDescription('The location to fetch forecast for.')
    ).addBooleanOption(option => option
      .setName('celsius')
      .setDescription('If you want values in Celsius.')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let location = interaction.options.getString('location') ?? 'fetch';
    if (location == 'fetch') {
      let query_result = await async_query("SELECT * FROM data.setloc WHERE userId = ?;", [interaction.user.id])
      if (query_result.length == 0) {
        interaction.editReply("You need to set a location with /setloc if you wish to use this command without a location parameter!")
        return
      } else {
        location = query_result[0].locString;
      }
    }
    let geo_result = await getGeoInfo(location);
    if (Object.keys(geo_result).length === 0) {
      interaction.editReply("I couldn't find that place. :(");
      return;
    }
    let celsius = (geo_result.country == 'US') ? false : true;
    celsius = interaction.options.getBoolean('celsius') ?? celsius;
    let forecast = await getForecast(geo_result.lat, geo_result.lon, celsius);
    if (forecast.length === 0) {
      interaction.editReply("Open Weather API messed it up!");
      return;
    }
    let t_unit = (celsius) ? '°C' : '°F';
    let s_unit = (celsius) ? 'm/s' : 'mph';
    let days = ['`Sun:`','`Mon:`','`Tue:`','`Wed:`','`Thu:`','`Fri:`','`Sat:`'];
    let state_str = (geo_result.state.length > 0) ? ', ' + geo_result.state : '';
    let reply = `Forecast for **${geo_result.name}${state_str}**  ${getFlag(geo_result.country)}`;
    for (let i = 0; i < forecast.length; i++) {
      reply += `\n${days[new Date(forecast[i].dt*1000).getDay()]}  `;
      reply += `${getSymb(forecast[i].weather[0].id)}  |  `
      reply += `⬆️  \`${forecast[i].temp.max.toFixed(1).toString().padStart(5, ' ')} ${t_unit}\`  |  `;
      reply += `⬇️  \`${forecast[i].temp.min.toFixed(1).toString().padStart(5, ' ')} ${t_unit}\`  |  `;
      reply += `🌬️ \`${forecast[i].wind_speed.toFixed(1).toString().padStart(4, ' ')} ${s_unit}\``;
    }
    interaction.editReply(reply);
	}
};

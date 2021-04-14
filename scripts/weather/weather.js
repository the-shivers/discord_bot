"use strict";

// Define constants
const fs = require('fs');
const request = require('request');
const getFlag = require('./flags.js').getFlag;
const getSymb = require('./symbols.js').getSymb;
const getDesc = require('./descriptions.js').getDescription;
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));
var open_weather_options = api_keys.open_weather_options;


function deg_to_comp(deg) {
  // Converts a degree number (0-360) to a compass bearing.
  let compass_index = Math.round(deg / 22.5);
  let compass_dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
  ]
  return compass_dirs[compass_index];
}


function weather(msg, content) {
  let components = content.split(' ');
  var units = 'imperial';
  var t_unit = '°F';
  var s_unit = 'mph';
  if (components[1] === "-u") {
    if (components[2].toLowerCase() === "metric") {
      units = "metric"
      t_unit = '°C';
      s_unit = 'm/s'
    } else if (components[2].toLowerCase() === "standard") {
      units = "standard"
      t_unit = 'K';
      s_unit = 'm/s'
    }
    open_weather_options.qs.q = components.slice(3).join(' ');
  } else {
    open_weather_options.qs.q = components.slice(1).join(' ');
  }
  open_weather_options.qs['units'] = units;
  request(open_weather_options, function (error, response, body) {
    if (error) throw new Error(error);
    let parsed = JSON.parse(body);
    console.log(open_weather_options.qs)
    console.log(parsed);
    if (parsed.cod === '404') {
      msg.channel.send("I couldn't find that place. 😭")
    } else {
      let symb = getSymb(parsed.weather[0].id);
      let desc = getDesc(parsed.weather[0].id);
      let str = ""
      + "**Place: **" + parsed.name + " " + getFlag(parsed.sys.country) + "\n"
      + "**Weather: **" + desc + " " + symb + "\n"
      + "**Temperature: **" + parsed.main.temp.toFixed(1) + t_unit + " | "
      + "**Feels like: **" + parsed.main.feels_like.toFixed(1) + t_unit + " \n"
      + "**Hum: **" + parsed.main.humidity.toFixed(1) + "% "
      + "| **Wind: **" + parsed.wind.speed.toFixed(1) + " " + s_unit + " "
      + deg_to_comp(parsed.wind.deg);
      msg.channel.send(str);
    }

  });
}

module.exports = { weather };

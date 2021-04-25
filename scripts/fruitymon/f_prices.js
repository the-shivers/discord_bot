"use strict";

// Define Constants
const fs = require('fs');
const fruit_dict_filename = './fruit_dict.json';
const fruit_dict_filename_full = './scripts/fruitymon/fruit_dict.json';
var fruit_dict = require(fruit_dict_filename);

// Define key functions
function coreSinusoid(amp, cycle_days, time, phase) {
  let freq = 1 / cycle_days;
  let inner_func = Math.PI * 2 * freq * (time + phase)
  return Math.sin(inner_func) * amp;
}

function noise(factor) {
  return factor * (Math.random() - 0.5);
}

function generatePastDaysWithYears(n) {
  // Returns array of 2001-01-01 style dates, including current day, length n
  let today = new Date();
  let offset = 24*60*60*1000;
  let date_list = []
  let d = new Date();
  for (let i = 0; i < n; i++) {
    let new_date = new Date();
    new_date.setTime(d.getTime()-(offset * i));
    let month = ("0" + (new_date.getUTCMonth() + 1)).slice(-2);
    let day = ("0" + new_date.getUTCDate()).slice(-2);
    let year = new_date.getUTCFullYear();
    date_list.push(month + "-" + day + "-" + year);
  }
  date_list.reverse()
  return date_list
}

function generatePastDays(n) {
  // Returns array of 2001-01-01 style dates, including current day, length n
  let today = new Date();
  let offset = 24*60*60*1000;
  let date_list = []
  let d = new Date();
  for (let i = 0; i < n; i++) {
    let new_date = new Date();
    new_date.setTime(d.getTime()-(offset * i));
    let month = ("0" + (new_date.getUTCMonth() + 1)).slice(-2);
    let day = ("0" + new_date.getUTCDate()).slice(-2);
    date_list.push(month + "-" + day);
  }
  date_list.reverse()
  return date_list
}

function updatePrice(fruit_str, dates_to_update) {
  // Dates to update should be earliest to latest, 2001-01-01, 2001-01-02, etc.
  if ( // If lacking prices or lacking first date for prices
    !("hist_prices" in fruit_dict[fruit_str]) ||
    !(dates_to_update[0] in fruit_dict[fruit_str].hist_prices)
  ) {
    // Generate all prices using constant value. True update comes tomorrow.
    fruit_dict[fruit_str]["hist_prices"] = {};
    let values = Array(dates_to_update.length).fill(fruit_dict[fruit_str].exp);
    dates_to_update.forEach(function(item, index) {
      fruit_dict[fruit_str]["hist_prices"][item] = values[index]
    });
  } else {
    // Update prices one at a time if missing based on previous price
    for (let i = 1; i < dates_to_update.length; i++) {
      if (!(dates_to_update[i] in fruit_dict[fruit_str].hist_prices)) {
        let next_price = getNextPrice(
          fruit_str,
          fruit_dict[fruit_str].hist_prices[dates_to_update[i - 1]],
          dates_to_update[i]
        );
        fruit_dict[fruit_str].hist_prices[dates_to_update[i]] = next_price
      }
    }
  }
}

function getNextPrice(fruit_str, last_price, date) {
  console.log("In getNextPrice! fruit_str:", fruit_str, "last_price:", last_price)
  // Intercept should already be accounted for by last price
  let d = new Date(date);
  // let d = new Date();
  let date_int = Math.floor(d/8.64e7) - 18741; // today - 2021/04/24
  let sin_part = coreSinusoid(
    fruit_dict[fruit_str].amplitude / fruit_dict[fruit_str].period,
    fruit_dict[fruit_str].period,
    date_int,
    fruit_dict[fruit_str].offset
  );
  let noise_part = noise(fruit_dict[fruit_str].rw_amplitude);
  console.log("noise:", noise_part, "sin:", sin_part)
  return last_price + noise_part + sin_part;
}

function updateAllPrices(dates_to_update) {
  for (const key of Object.keys(fruit_dict)) {
    updatePrice(key, dates_to_update)
  }
  fs.writeFileSync(
    fruit_dict_filename_full,
    JSON.stringify(fruit_dict, null, 2),
    function writeJSON(err) {
    if (err) return console.log(err);
  });
}

module.exports = {updateAllPrices, generatePastDaysWithYears, generatePastDays};

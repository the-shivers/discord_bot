// Define Constants
const fs = require('fs');
const request = require("request");
const Discord = require("discord.js");
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));
const f = require('../../funcs.js');

// API Options
var ud_options = api_keys.ud_options;

function interpretUrbanString(text) {
  // Returns array: first a bool (corresponding to whether the text was valid),
  // then a search term string and a positive int.

  let is_valid = true
  let search_term = ""
  let def_num = 0;

  let components = text.split(' ');
  components.shift();

  if (components.length === 1) {
    search_term = components[0].replace('"',"");
  } else if (
    components.length > 1
    && !text.includes(",")
  ) {
    search_term = components.join(' ');
  } else if (
    components.length > 1
    && text.includes(",")
    && f.isNumeric(text.split(", ")[1])
  ) {
    search_term = components.join(' ').split(", ")[0];
    def_num = Math.abs(parseInt(text.split(", ")[1], 10));
  } else {
    is_valid = false;
  }
  return [is_valid, search_term, def_num];
}

async function urbanDictionary(msg, is_valid, search_term, def_num) {
  // Sends messages based on urban dictionary search parameters.
  if (is_valid) {
    ud_options.qs.term = search_term;
    request(ud_options, function (error, response, body) {
      if (error) throw new Error(error);
      if (
        "error" in JSON.parse(body) &&
        JSON.parse(body).error.startsWith("An error occurred")
      ) {
        msg.channel.send("A weird Urban Dictionary error occurred.");
      } else {
        let result_list = JSON.parse(body).list;
        def_num = Math.min(def_num, result_list.length - 1);
        if (result_list.length > 0) {

          // Get and format word
          let word = result_list[def_num].word;
          word = "__**" + word + "**__\n";

          // Get and format definition
          let definition = result_list[def_num].definition;
          definition = ">>> " + definition.replace(/\[|\]/g, '');
          if (definition.length > 1400) {
            definition = definition.substring(0, 1500);
          }
          definition = definition + "\n\n";

          // Get and format example
          let example = result_list[def_num].example;
          example = example.replace(/\[|\]|\*/g, '');
          if (example.length > 400) {
            example = example.substring(0, 1800 - definition.length);
          }
          example = "*" + example.trim() + "*";

          msg.channel.send(word + definition + example);
        } else {
          msg.channel.send("No results.");
        }
      }
    })
  } else {
    msg.channel.send("Invalid search!");
  }
}

function ud(msg, content) {
  let ud_arr = interpretUrbanString(content);
  urbanDictionary(msg, ud_arr[0], ud_arr[1], ud_arr[2]);
}

module.exports = { ud };

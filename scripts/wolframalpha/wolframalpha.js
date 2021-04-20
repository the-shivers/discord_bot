// Define Constants
const fs = require('fs');
const request = require("request");
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));

// API Options
var wa_options = api_keys.wolframAlpha;
const max_pods = 3;
let url = wa_options.url;
let query = 'pi';
let url2 = '&appid=';
let appid = wa_options.appid;
let url3 = '&output=json&format=plaintext';

// Functions
function wolframAlpha(msg, content) {
  //Wolf it up...
  //query = content.split(' ').slice(1).join('\%20');
  query = content.split(' ').slice(1).join(' ');
  query = encodeURIComponent(query);
  request(url+query+url2+appid+url3, function (error, response, body) {
  	if (error) throw new Error(error);
    let parsed = JSON.parse(body);
    if (parsed.queryresult.success) {
      var num_pods = Math.min(parsed.queryresult.pods.length, max_pods);
      var i;
      return_msg = ''
      for (i = 0; i < num_pods; i++) {
        return_msg += "**" + parsed.queryresult.pods[i].title + "**\n"
        return_msg += parsed.queryresult.pods[i].subpods[0].plaintext + "\n\n"
      }
      msg.channel.send(return_msg);
    } else {
      msg.channel.send("Wolfram messed it up!!!");
    }
  });
}

module.exports = { wolframAlpha };

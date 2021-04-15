// Define Constants
const fs = require('fs');
const request = require("request");
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));

// API Options
var bing_options = api_keys.bing_options;

function getBody(query) {
  bing_options.qs.q = query;
  return new Promise(function(resolve, reject) {
    request.get(bing_options, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body).value);
      }
    })
  })
}

async function getBingUrl(query) {
  result = await getBody(query);
  if (result.length === 0) {
    return "";
  } else {
    return result[0].contentUrl;
  }
}

async function bing(msg, content) {
  //just bing it
  let components = content.split(' ');
  if (components.length > 1) {
    query = components.slice(1).join(' ');
    if (query.length > 150) {
      msg.channel.send("That bing was too long!");
    } else {
      result = await getBingUrl(query);
      if (result.length === 0) {
        msg.channel.send("Bing messed it up!");
      } else {
        msg.channel.send(result);
      }
    }
  } else {
    msg.channel.send("Did you forget to bing something?");
  }
}

module.exports = { getBingUrl, bing };

// Define Constants
const fs = require('fs');
const request = require("request");
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));

// API Options
var fake_bing_options = api_keys.fake_bing_options;

function getBody(query) {
  fake_bing_options.qs.q = query;
  return new Promise(function(resolve, reject) {
    request.get(fake_bing_options, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body).value);
      }
    })
  })
}

async function getFakeBingUrl(query) {
  result = await getBody(query);
  console.log("Result is...", result)
  if (result.length === 0) {
    return "";
  } else {
    return result[0].url;
  }
}

async function fake_bing(msg, content) {
  //just bing it
  let components = content.split(' ').filter(Boolean);
  if (components.length > 1) {
    query = components.slice(1).join(' ');
    if (query.length > 150) {
      msg.channel.send("That fake bing was too long!");
    } else {
      result = await getFakeBingUrl(query);
      console.log(result)
      if (result.length === 0) {
        msg.channel.send("Fake ing messed it up!");
      } else {
        msg.channel.send(result);
      }
    }
  } else {
    msg.channel.send("Did you forget to fake bing something?");
  }
}

module.exports = { fake_bing, getFakeBingUrl };

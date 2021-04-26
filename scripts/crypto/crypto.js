// Define Constants
const fs = require('fs');
const f = require('../../funcs.js');
const request = require("request");
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));
const Discord = require('discord.js');


// API Options
var coin_market_cap = api_keys.coin_market_cap;

function interpretNumber(num) {
  // returns epic emojis based on the number and formats it
  if (num < -20) {return "`" + (num).toFixed(2) + "%` \n⬇️ ⬇️ ⬇️"}
  if (num < -5) {return "`" + (num).toFixed(2) + "%` \n⬇️ ⬇️"}
  if (num < 0) {return "`" + (num).toFixed(2) + "%` \n⬇️"}
  if (num < 5) {return "`" + (num).toFixed(2) + "%` \n⬆️"}
  if (num < 20) {return "`" + (num).toFixed(2) + "%` \n⬆️ ⬆️"}
  if (num >= 20) {return "`" + (num).toFixed(2) + "%` \n⬆️ ⬆️ ⬆️"}
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function crypto(msg, content) {
  if (content.split(' ').length === 2) {
    request(coin_market_cap, function (error, response, body) {
      if (error) throw new Error(error);
      if ("data" in body && body.data.length > 0) {
        // console.log(body);
        let seek = content.split(' ')[1].toUpperCase();
        for (let i = 0; i < body.data.length; i++) {
          if (
            body.data[i].name === seek ||
            body.data[i].slug === seek ||
            body.data[i].symbol === seek
          ) {
            let name = body.data[i].name;
            let symbol = body.data[i].symbol;
            let data = body.data[i].quote.USD;
            let price = "$" + numberWithCommas(data.price);
            price = price.split('.')[0] + "." + price.split('.')[1].slice(0,2)
            let market_cap = "$" + numberWithCommas(data.market_cap);
            market_cap = market_cap.split('.')[0] + "." + market_cap.split('.')[1].slice(0,2)
            let percent_change_1h = interpretNumber(data.percent_change_1h);
            let percent_change_24h = interpretNumber(data.percent_change_24h);
            let percent_change_7d = interpretNumber(data.percent_change_7d);

            //set kino style
            console.log(data.percent_change_24h);
            if (data.percent_change_24h < -5) {
              var color = ('#fa6489');
              var full_loc = './scripts/crypto/assets/pink_wojak.jpg';
              var loc = 'pink_wojak.png';
              var caption = "AAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAA";
            } else if (data.percent_change_24h > 5) {
              var color = ('#44e517');
              var full_loc = './scripts/crypto/assets/green_wojak.jpeg';
              var loc = 'green_wojak.png';
              var caption = "OOOOOOOOOOOOOOOOOO\nOOOOOOOOOOOOOOOOOO";
            } else {
              var color = ('#AAAAAA');
              var full_loc = './scripts/crypto/assets/wojaks.png';
              var loc = 'wojaks.png';
              var caption = "\u200b";
            }

            const attachment = new Discord.MessageAttachment(full_loc, loc);
            const template = new Discord.MessageEmbed()
              .setColor(color)
              .setTitle(name + " (" + symbol + ")")
              .setDescription('Price: `' + price + '` | Market Cap: `' + market_cap + "`")
              .attachFiles(attachment)
              .setThumbnail('attachment://' + loc)
              .addField('Hourly Price Change', percent_change_1h, true)
              .addField('Daily Price Change', percent_change_24h, true)
              .addField('Weekly Price Change', percent_change_7d, true)
              .setFooter(caption);
            msg.channel.send(template);
            return;
          }
        }
      }
    });
  } else {
    msg.channel.send("You suck, try again...");
  }
}

module.exports = {crypto};

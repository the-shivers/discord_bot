// Define Constants
const fs = require('fs');
const request = require("request");
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));
const Discord = require('discord.js');
const attachment = new Discord.MessageAttachment(
  './scripts/bing/assets/bing_logo.png', 'bing_logo.png'
);

// API Options
var bingw_options = api_keys.bingw_options;
var bingn_options = api_keys.bingn_options;

function bingw(msg, content) {
  if (content.split(' ').length > 1) {
    let query = content.split(' ').slice(1).join(' ');
    bingw_options.qs.q = query;
    request(bingw_options, function (error, response, body) {
      if (error) throw new Error(error);
      parsed = JSON.parse(body);
      if ('webPages' in parsed && parsed.webPages.value.length > 0) {
        let pages = parsed.webPages.value;
        const template = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle("Just Bing It!")
          .attachFiles(attachment)
          .setThumbnail('attachment://bing_logo.png');
        template.setDescription(
          "This is what happens when you bing `" + query + "`!"
        );
        for (i = 0; i < pages.length; i++) {
          template.addField(
            "\u200b",
            "[" + pages[i].name + "]("+ pages[i].url + ")\n" + pages[i].snippet
          )
        }
        msg.channel.send(template);
      } else {
        msg.channel.send("Bing fucked up!");
      }
    });
  } else {
    msg.channel.send("You forgot to bing!");
  }
}

function bingn(msg, content) {
  if (content.split(' ').length > 1) {
    let query = content.split(' ').slice(1).join(' ');
    bingn_options.qs.q = query;
    request(bingn_options, function (error, response, body) {
      if (error) throw new Error(error);
      parsed = JSON.parse(body);
      if ('webPages' in parsed && parsed.webPages.value.length > 0) {
        let pages = parsed.webPages.value;
        const template = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle("Just Bing It!")
          .attachFiles(attachment)
          .setThumbnail('attachment://bing_logo.png');
        template.setDescription(
          "This is what happens when you bing news `" + query + "`!"
        );
        for (i = 0; i < pages.length; i++) {
          template.addField(
            "\u200b",
            "[" + pages[i].name + "]("+ pages[i].url + ")\n" + pages[i].snippet
          )
        }
        msg.channel.send(template);
      } else {
        msg.channel.send("Bing fucked up!");
      }
    });
  } else {
    msg.channel.send("You forgot to bing!");
  }
}

module.exports = {bingw, bingn};

"use strict";

// Imports
const fs = require('fs');
const request = require("request");
const validUrl = require('valid-url');
const Discord = require('discord.js');
const api_keys = JSON.parse(fs.readFileSync('./api_keys.json', 'utf8'));

let options = api_keys.face_options;

async function getLastImage(msg) {
  const msg_limit = 20;
  let messages = await msg.channel.messages.fetch({ limit: msg_limit })
  let message = messages.filter(a => a.attachments.size > 0 || a.embeds.length ).first()
  if (message === undefined) {
    msg.channel.send("I'm sorry, I couldn't find it... 😢 Maybe I'm not a good bot after all....");
    return ;
  }
  let url = ""
  if (message.embeds.length !== 0) {
    // Get URL, then image URL then thumbnail URL if possible.
    if (
      message.embeds[0].url !== null &&
      (
        [".JPG", ".GIF", ".PNG", ".BMP", ".SVG", ".PSD", ".ICO"].includes(message.embeds[0].url.slice(-4).toUpperCase()) ||
        [".WEBP", ".TIFF", ".AVIF", ".HEIC", ".HEIF"].includes(message.embeds[0].url.slice(-5).toUpperCase())
      )
    ) {
      url = message.embeds[0].url;
    } else if (message.embeds[0].image !== null && message.embeds[0].image.url !== null) {
      url = message.embeds[0].image.url;
    } else if (message.embeds[0].thumbnail !== null && message.embeds[0].thumbnail.url !== null) {
      url = message.embeds[0].thumbnail.url;
    }
  } else {
    url = message.attachments.first().url;
  }
  return url;
}

async function face(msg, content) {
  msg.channel.send('le face has arrived')
  let query;
  if (content.split(" ").length <= 1) {
    query = await getLastImage(msg);
  } else {
    query = content.split(" ").filter(Boolean).slice(1).join(" ").trim();
    if (!(validUrl.isUri(query))) {
      msg.channel.send("Not a valid url.")
      return ;
    }
  }
  options.body.url = query;
  request(options, function (error, response, body) {
  	if (error) throw new Error(error);
    if ("error" in body || body.length === 0) {
      msg.channel.send("Error. :(")
      return ;
    } else {
      let gender = body[0].faceAttributes.gender
      let age = body[0].faceAttributes.age
      let emotions = `Anger: \`${body[0].faceAttributes.emotion.anger}\`\n`;
      emotions += `Contempt: \`${body[0].faceAttributes.emotion.contempt}\`\n`;
      emotions += `Disgust: \`${body[0].faceAttributes.emotion.disgust}\`\n`;
      emotions += `Fear: \`${body[0].faceAttributes.emotion.fear}\`\n`;
      emotions += `Hapiness: \`${body[0].faceAttributes.emotion.happiness}\`\n`;
      emotions += `Neutral: \`${body[0].faceAttributes.emotion.neutral}\`\n`;
      emotions += `Sadness: \`${body[0].faceAttributes.emotion.sadness}\`\n`;
      emotions += `Surprise: \`${body[0].faceAttributes.emotion.surprise}\`\n`;
      const attachment = new Discord.MessageAttachment(
        query, query.split('/').slice(-1)[0]
      );
      const template = new Discord.MessageEmbed()
        .setColor('#3344BB')
        .setTitle("Face status: ANALYZED")
        .attachFiles(attachment)
        .setThumbnail('attachment://' + query.split('/').slice(-1)[0])
        .addField("Age:", `\`${age}\``, true)
        .addField("Gender:", `\`${gender}\``, true)
        .addField("Emotions:", emotions, false);
      msg.channel.send(template)
    }
  });
}

module.exports = {face}

"use strict";

// Import Stuff
const Discord = require("discord.js");
const Canvas = require('canvas');
const probe = require('probe-image-size');

// Functions
async function stamp(msg, content) {
  let caption = content.split(" ").slice(1).join(" ");
  if (caption.length > 10) {
    msg.channel.send("That's too long! It's just a stamp, not a novel!");
    // return;
    msg.channel.send("but i'll let it slide")
  }
  const msg_limit = 20;
  let messages = await msg.channel.messages.fetch({ limit: msg_limit })
  let message = messages.filter(a => a.attachments.size > 0 || a.embeds.length ).first()
  if (message === undefined) {
    msg.channel.send("I'm sorry, I couldn't find it... 😢 Maybe I'm not a good bot after all....");
    return ;
  }
  console.log("Message.embeds is:", message.embeds)
  console.log("Message.attachments is:", message.attachments)
  // console.log("Whole message is:", message)
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
      console.log("in url section")
      url = message.embeds[0].url;
    } else if (message.embeds[0].image !== null && message.embeds[0].image.url !== null) {
      url = message.embeds[0].image.url;
      console.log("in image section")
    } else if (message.embeds[0].thumbnail !== null && message.embeds[0].thumbnail.url !== null) {
      console.log("in thmb section")
      url = message.embeds[0].thumbnail.url;
    }
    console.log(message.embeds[0].url)
    console.log(message.embeds[0].image)
    console.log(message.embeds[0].thumbnail)
  } else {
    url = message.attachments.first().url;
  }
  console.log("parsed url", url)
  let probe_result = await probe(url);
  let height = probe_result.height;
  let width = probe_result.width;
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage(url);
  ctx.drawImage(background, 0, 0, width, height);

  // const text_can = Canvas.createCanvas(width*1.5, height*1.5)
  // const text_ctx = text_can.getContext('2d');
  // let line_width = (width / 50).toString();
  // let font_size = (width / 5);
  // let font_size_str = font_size.toString() + "px";
  // let color = "#991111"
  // text_ctx.textAlign = "center";
  // text_ctx.font = '900 ' + font_size_str + ' Courier New';
  // text_ctx.fillStyle = color;
  // let txt = caption.toUpperCase()
  // let txt_w = text_ctx.measureText(txt).width;
  // let rect_width = 1.15 * txt_w;
  // let rect_height = font_size * 0.9;
  // let rect_x = (width*1.5 - rect_width)/2;
  // let rect_y = font_size*1.3 + line_width/2;
  // text_ctx.translate(rect_width/2 + rect_x, rect_height/2 + rect_y);
  // text_ctx.rotate(-Math.PI/8);
  // text_ctx.translate(-(rect_width/2 + rect_x), -(rect_height/2 + rect_y));
  // text_ctx.globalAlpha = 0.8;
  // text_ctx.beginPath();
  // text_ctx.lineWidth = line_width;
  // text_ctx.strokeStyle = color;
  // text_ctx.rect(rect_x, rect_y, rect_width, rect_height);
  // text_ctx.stroke();
  // text_ctx.fillText(txt, (1.5 * width) / 2, font_size * 2.1);

  //^[A-Za-z0-9 .,!"'?$]*$

  const text_can = Canvas.createCanvas(width*1.5, height*1.5)
  const text_ctx = text_can.getContext('2d');
  let line_width = (width / 50).toString();
  let font_size = (width / 5);
  let font_size_str = font_size.toString() + "px";
  let color = "#991111"
  text_ctx.textAlign = "center";
  text_ctx.font = '900 ' + font_size_str + ' Courier New';
  text_ctx.fillStyle = color;
  let txt = caption.toUpperCase().trim();
  let txt_w = text_ctx.measureText(txt).width;
  let rect_width = 1.15 * txt_w;
  let rect_x = (width*1.5 - rect_width)/2;
  let rect_height;
  let rect_y;
  if (/^[A-Za-z0-9 .,!"'?$]*$/.test(txt)) {
    rect_height = font_size * 0.9;
    rect_y = font_size*1.3 + line_width/2;
  } else {
    rect_height = font_size * 1.3;
    rect_y = font_size*1.05 + line_width/2;
  }
  text_ctx.translate(rect_width/2 + rect_x, rect_height/2 + rect_y);
  text_ctx.rotate(-Math.PI/8);
  text_ctx.translate(-(rect_width/2 + rect_x), -(rect_height/2 + rect_y));
  text_ctx.globalAlpha = 0.8;
  text_ctx.beginPath();
  text_ctx.lineWidth = line_width;
  text_ctx.strokeStyle = color;
  text_ctx.rect(rect_x, rect_y, rect_width, rect_height);
  text_ctx.stroke();
  text_ctx.fillText(txt, (1.5 * width) / 2, font_size * 2.1);

  ctx.drawImage(text_can,
    width/2 - (1.5*width)/2,
    height / 2 - rect_y - rect_height/2,
    width*1.5,
    height*1.5);
  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'uwu.png');
  msg.channel.send(attachment);
}

function based(msg, content) {
  stamp(msg, "stamp based")
}

function cringe(msg, content) {
  stamp(msg, "stamp cringe")
}


module.exports = {stamp, cringe, based};

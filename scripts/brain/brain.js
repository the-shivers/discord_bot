"use strict";

// Define Constants
const Discord = require("discord.js");
const fs = require('fs');
const Canvas = require('canvas');
const f = require('../../funcs.js');
const d = require('../drake/drake.js');




const char_limits = {
  "12": 43,
  "14": 37,
  "16": 32,
  "18": 28,
  "24": 22,
  "36": 15,
}


//will probs needt o change this since we have fewer lines
function determineFontSize(string) {
  if (string.length > 364) {
    return 12;
  } else if (string.length > 320) {
    return 14;
  } else if (string.length > 270) {
    return 16;
  } else if (string.length > 220) {
    return 18;
  } else if (string.length > 70) {
    return 24;
  } else {
    return 36;
  }
}

function determineLines(w_arr, font_size_str) {
  // returns an array of line strings
  let return_arr = [];
  let sum = 0;
  let line_str = "";
  for (let i = 0; i < w_arr.length; i++) {
    sum += 1 + w_arr[i].length;
    if (sum >= char_limits[font_size_str]) {
      return_arr = return_arr.concat(line_str + "\n" + w_arr[i] + " ");
      line_str = "";
      sum = w_arr[i].length;
    } else {
      line_str += w_arr[i] + " ";
    }
  }
  return_arr = return_arr.concat(line_str + "\n");
  return return_arr;
}

function brainParameters(contents) {
  // returns array of key parameters, imagestr and height
  if (contents.split("|").length === 3) {
    return ["template_3.jpg", 655];
  } else if (contents.split("|").length === 4) {
    return ["template_4.jpg", 883];
  } else {
    return ["template_5.jpg", 1099];
  }
}

async function brain(msg, contents) {
  // Determine if entry was valid
  if (
    contents.includes("|") &&
    contents.split("|").length >= 3 &&
    contents.length > 7
  ) {
    // First process the contents.
    let rem_contents = contents.split(" ").slice(1).join(" ");
    let bp = brainParameters(rem_contents)
    let img = bp[0];
    let height = bp[1];
    let parts = rem_contents.replace(" | ", "|").split("|");
    const canvas = Canvas.createCanvas(700, height);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./scripts/brain/assets/'+ img);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.textAlign ='center';
    // Loop and add text
    for (let i = 0; i < Math.min(parts.length,5); i++) {
      let fsize = determineFontSize(parts[i]);
      console.log(fsize);
      ctx.font = fsize + 'px Arial';
      let lines = determineLines(parts[i].split(' '), fsize.toString());
      ctx.fillText(lines.join(''), 170, -10 + (i*215) + (295 - (fsize * lines.length)) / 2);
    }
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'brain.jpg');
    msg.channel.send(` `, attachment);
  } else {
    msg.channel.send("do it right!");
  }
}

module.exports = { brain };

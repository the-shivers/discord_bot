"use strict";

// Define Constants
const Discord = require("discord.js");
const fs = require('fs');
const Canvas = require('canvas');
const f = require('../../funcs.js');
const d = require('../drake/drake.js');




const char_limits = {
  "12": 46,
  "14": 40,
  "16": 35,
  "18": 30,
  "24": 24,
  "36": 16,
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
  } else if (string.length > 90) {
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
    line_str += w_arr[i] + " ";
    sum += 1 + w_arr[i].length;
    if (sum >= char_limits[font_size_str]) {
      return_arr = return_arr.concat(line_str + "\n");
      line_str = "";
      sum = 0;
    }
  }
  return_arr = return_arr.concat(line_str + "\n");
  return return_arr;
}

function brainParameters(content) {
  // returns array of key parameters, imagestr and height
  if (content.split("|").length === 3) {
    return [3"template_3.jpg", 655];
  } else if (content.split("|").length === 4) {
    return ["template_4.jpg", 883];
  } else {
    return ["template_5.jpg", 1099];
  }
}

async function brain(msg, contents) {
  // Determine if entry was valid
  if (
    contents.includes("|") &&
    content.split("|").length >= 3
    contents.length > 7
  ) {
    // First process the contents.
    let rem_contents = contents.split(" ").slice(1).join(" ");
    let bp = brainParameters(rem_contents)
    let img = bp[0];
    let height = bp[1];
    let parts = rem_contents.replace(" | ", "|").split("|");


    let a_size = determineFontSize(a_part);
    let a_processed = determineLines(a_part.split(' '), a_size.toString());
    let b_size = determineFontSize(b_part);
    let b_processed = determineLines(b_part.split(' '), b_size.toString());
    // Create and fill canvas
    const canvas = Canvas.createCanvas(701, 1066);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./scripts/brain/assets/template.jpg');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.textAlign ='center';
    // Add a-text
    ctx.font = a_size + 'px Arial';
    ctx.fillText(a_processed.join(''), 520, 10 + (295 - (a_size * a_processed.length)) / 2);
    ctx.font = b_size + 'px Arial';
    ctx.fillText(b_processed.join(''), 520, 310 + (295 - (b_size * b_processed.length)) / 2);
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'drake.jpg');
    msg.channel.send(` `, attachment);
  } else {
    msg.channel.send("do it right!");
  }
}

module.exports = { brain };

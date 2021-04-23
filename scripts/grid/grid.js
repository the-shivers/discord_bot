"use strict";

// Define Constants
const Discord = require("discord.js");
const Canvas = require('canvas');
const f = require('../../funcs.js');
const fs = require('fs');
var pairs = JSON.parse(
  fs.readFileSync('scripts/grid/grid.json', 'utf8')
).pairs;
const width = 700;
const height = 700;

function getGuildMembers(msg) {
  return msg.guild.members.fetch();
}

function getRadius(n) {
  if (n > 50) return 30;
  if (n > 25) return 35;
  if (n > 20) return 40;
  return 45;
}

function awaitAll(list, asyncFn) {
  const promises = [];
  list.forEach(x => {
    promises.push(asyncFn(x.user.displayAvatarURL({ format: 'jpg' })));
  });
  return Promise.all(promises);
}

async function grid(msg, content) {
  const canvas = Canvas.createCanvas(width, height);
	const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage('./scripts/grid/assets/grid.jpg');
	ctx.drawImage(background, 0, 0, width, height);
  let guild_membs = await getGuildMembers(msg);
  let gm_arr = f.shuffle(guild_membs.array());
  let rad = getRadius(gm_arr.length);

  // Get text
  if (content.split(',').length === 2 && content.split('-').length === 3) {
    let rem_content = content.split(' ').slice(1).join(' ');
    let first_part = rem_content.split(',')[0];
    let second_part = rem_content.split(',')[1];
    var north = first_part.split('-')[0]
    var south = first_part.split('-')[1]
    var east = second_part.split('-')[0]
    var west = second_part.split('-')[1]
  } else {
    pairs = f.shuffle(pairs);
    var north = pairs[0][0]
    var south = pairs[0][1]
    var east = pairs[1][0]
    var west = pairs[1][1]
  }

  // Asynchronously get images
  let load_arr = await awaitAll(gm_arr, Canvas.loadImage)

  // Loop through images and draw
  for (let i = 0; i < gm_arr.length; i++) {
    let x = Math.random() * (width - rad * 2);
    let y = Math.random() * (height - rad * 2);
    var new_canvas = Canvas.createCanvas(rad * 2, rad * 2);
    var new_ctx = new_canvas.getContext('2d');
    new_ctx.beginPath();
    new_ctx.arc(rad, rad, rad, 0, Math.PI * 2, true);
    new_ctx.clip();
    let avatar = load_arr[i]
  	new_ctx.drawImage(avatar, 0, 0, rad*2, rad*2);
    ctx.drawImage(new_canvas, x, y, rad*2, rad*2);
  }

  // Text
  ctx.textAlign = "center";
  ctx.font = '32px comic sans ms';
  ctx.fillText(north.trim(), width / 2, 30);
  ctx.fillText(south.trim(), width / 2, height - 15);
  ctx.rotate(Math.PI/2);
  ctx.fillText(east.trim(), width / 2, - 15);
  ctx.rotate(Math.PI);
  ctx.fillText(west.trim(), -width / 2, height - 15);

  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
  msg.channel.send(attachment);
}


module.exports = { grid };

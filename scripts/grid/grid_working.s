"use strict";

// Define Constants
const Discord = require("discord.js");
// const fs = require('fs');
const Canvas = require('canvas');
const f = require('../../funcs.js');

// async function getGuildMember(msg, user) {
//   return msg.guild.members.fetch(user.id);
// }

const width = 700;
const height = 700;

function getGuildMembers(msg) {
  console.log("In getGuildMembers");
  return msg.guild.members.fetch();
}

function getRadius(n) {
  if (n > 50) return 30;
  if (n > 25) return 40;
  if (n > 20) return 45;
  return 50;
}

async function grid(msg, content) {
  msg.channel.send("AAAAAAAAAAA")
  const canvas = Canvas.createCanvas(width, height);
	const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage('./scripts/grid/assets/grid.jpg');
	ctx.drawImage(background, 0, 0, width, height);
  let guild_membs = await getGuildMembers(msg);
  let gm_arr = f.shuffle(guild_membs.array());
  let rad = getRadius(gm_arr.length);
  // let rad = 50;
  for (let i = 0; i < gm_arr.length; i++) {
  // for (let i = 19; i < gm_arr.length; i++) {
    console.log(rad + "is radius")
    let x = Math.random() * (width - rad * 2);
    let y = Math.random() * (height - rad * 2);
    var new_canvas = Canvas.createCanvas(rad * 2, rad * 2);
    var new_ctx = new_canvas.getContext('2d');
    new_ctx.beginPath();
    new_ctx.arc(rad, rad, rad, 0, Math.PI * 2, true);
    new_ctx.clip();
    let avatar = await Canvas.loadImage(gm_arr[i].user.displayAvatarURL({ format: 'jpg' }));
  	new_ctx.drawImage(avatar, 0, 0, rad*2, rad*2);
    ctx.drawImage(new_canvas, x, y, rad*2, rad*2);
    console.log(`at ${x}, ${y} drawing for ` + gm_arr[i].user.username)
  }




  // var avatar = await Canvas.loadImage(gm_arr[3].user.displayAvatarURL({ format: 'jpg' }));

  // ctx.beginPath();
  // ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
  // ctx.closePath();
  // ctx.beginPath();
  // ctx.moveTo(80+50, 80)
  // ctx.arc(80, 80, 50, 0, Math.PI * 2, true);
  // ctx.closePath();
  // ctx.beginPath();
  // ctx.moveTo(350+50, 350)
  // ctx.arc(350, 350, 50, 0, Math.PI * 2, true);
  // ctx.closePath();
  // ctx.beginPath();
  // ctx.moveTo(380+50, 350)
  // ctx.arc(380, 380, 50, 0, Math.PI * 2, true);
  // ctx.closePath();
  // ctx.beginPath();
  // ctx.moveTo(350+50, 320)
  // ctx.arc(380, 320, 50, 0, Math.PI * 2, true);
  // ctx.clip();
  //
  // var avatar1 = await Canvas.loadImage(gm_arr[3].user.displayAvatarURL({ format: 'jpg' }));
  // ctx.drawImage(avatar1, 0, 0, 100, 100);
  // ctx.drawImage(avatar1, 30, 30, 100, 100);
  // ctx.drawImage(avatar1, 300, 300, 100, 100);
  // ctx.drawImage(avatar1, 330, 330, 100, 100);
  // ctx.drawImage(avatar1, 330, 270, 100, 100);
  //
  // const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
  // msg.channel.send(`Welcome to the server, asdfasdfs!`, attachment);



  //new attempt working!

  // const canvas1 = Canvas.createCanvas(100, 100);
	// const ctx1 = canvas1.getContext('2d');
  // ctx1.beginPath();
	// ctx1.arc(50, 50, 50, 0, Math.PI * 2, true);
	// ctx1.clip();
	// ctx1.drawImage(avatar, 0, 0, 100, 100);
  //
  // const canvas2 = Canvas.createCanvas(100, 100);
	// const ctx2 = canvas2.getContext('2d');
  // ctx2.beginPath();
	// ctx2.arc(50, 50, 50, 0, Math.PI * 2, true);
	// ctx2.clip();
	// ctx2.drawImage(avatar, 0, 0, 100, 100);
  //
  // ctx.drawImage(canvas1, 0, 0);
  // ctx.drawImage(canvas2, 30, 30);

  // end new attempt

  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
  msg.channel.send(`Welcome to the server, asdfasdfs!`, attachment);
}

module.exports = { grid };

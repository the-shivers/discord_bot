"use strict";

const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const IV = 16;
const EV = 100;

let active_users = {}
let release_values = {
  "1": 2000, // legendary
  "2": 1500,
  "3": 1000,
  "4": 850,
  "5": 700,
  "6": 500,
  "7": 300,
  "8": 200,
  "9": 100 // most common
}

function activate_user(id, message_id) { //return and check for boolean
  console.log("In activate users at beginning.", active_users)
  if (active_users[id]) {
    return false;
  }
  active_users[id] = message_id;
  return true;
}

function deactivate_user(id) {
  console.log("In deactivate users at beginning.", active_users)
  delete active_users[id];
}

function getValue(pkmn_obj) {
  //pkmn obj should be pokemon id from encounters joined with pokedex info.
  if (pkmn_obj.level <= 0) {
    return 1
  }
  let base_money = release_values[pkmn_obj.baseFreq];
  let level_money = pkmn_obj.level * 20;
  let ev_money = (pkmn_obj.evStage - 1) * 600;
  if (pkmn_obj.isShiny == 1) {
    return (base_money + level_money + ev_money) * 2
  } else {
    return base_money + level_money + ev_money
  }
}

function getOtherStat(lvl, base) {
  return Math.floor(0.01 * (2 * base + IV + Math.floor(EV / 4)) * lvl) + 5;
}

function getHPStat(lvl, base) {
  return Math.floor(0.01 * (2 * base + IV + Math.floor(EV / 4)) * lvl) + lvl + 10;
}

function mulb32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function getMult(mulb32, seed) {
  return mulb32(seed)() / 2 - 0.25;
}

function getSymb(val) {
  if (val < -0.19) {return '---'}
  else if (val < -0.13) {return '-- '}
  else if (val < -0.06) {return '-  '}
  else if (val < 0.06) {return '   '}
  else if (val < 0.13) {return '+  '}
  else if (val < 0.19) {return '++ '}
  else if (val <= 0.25) {return '+++'}
  else {return 'error!!!!!'}
}

function getStats(epoch, lvl, pkmn_obj) {
  // Pokemon object should be a query result with .attack, .defense available.
  let keys = ['attack', 'defense', 'spAttack', 'spDefense', 'speed']
  let mult = getMult(mulb32, epoch);
  let stats = {hp: {
    val: Math.ceil(getHPStat(lvl, pkmn_obj.hp) * (1 + mult)),
    symb: getSymb(mult)
  }};
  for (let i = 0; i < keys.length; i++) {
    mult = getMult(mulb32, epoch + i + 1);
    stats[keys[i]] = {
      val: Math.ceil(getOtherStat(lvl, pkmn_obj[keys[i]]) * (1 + mult)),
      symb: getSymb(mult)
    }
  }
  return stats;
}

function clamp(v) {
  if (v < 0) {return 0}
  if (v > 255) {return 255}
  return Math.round(v + 0.5);
}

function d_to_r(degrees) {
  return degrees * (Math.PI/180);
}

function getHueMatrix(degrees) {
  let matrix = [[1,0,0],[0,1,0],[0,0,1]];
  let cosA = Math.cos(d_to_r(degrees))
  let sinA = Math.sin(d_to_r(degrees))
  matrix[0][0] = cosA + (1.0 - cosA) / 3.0
  matrix[0][1] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[0][2] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[1][0] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[1][1] = cosA + 1./3.*(1.0 - cosA)
  matrix[1][2] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[2][0] = 1.0/3.0 * (1.0 - cosA) - Math.sqrt(1./3.) * sinA
  matrix[2][1] = 1.0/3.0 * (1.0 - cosA) + Math.sqrt(1./3.) * sinA
  matrix[2][2] = cosA + 1.0/3.0 * (1.0 - cosA)
  return matrix;
}

function applyHueMatrix(matrix, r, g, b) {
  let rx = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]
  let gx = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]
  let bx = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]
  return [clamp(rx), clamp(gx), clamp(bx)]
}

async function getShinyAttachment(full_path, filename, shinyShift) {
  const width = 100;
  const height = 100;
  const canvas = Canvas.createCanvas(width, height);
	const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage(full_path);
  ctx.drawImage(background, 0, 0, width, height);
  let img_data = ctx.getImageData(0, 0, width, height);
  let new_img_data = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < height * width; i++) {
    let matrix = getHueMatrix(shinyShift);
    let pos = i * 4;
    let new_rgb = applyHueMatrix(matrix, img_data.data[pos], img_data.data[pos+1], img_data.data[pos+2])
    new_img_data.data[pos] = new_rgb[0];
    new_img_data.data[pos+1] = new_rgb[1];
    new_img_data.data[pos+2] = new_rgb[2];
  }
  ctx.putImageData(new_img_data, 0, 0)
  let attach = new MessageAttachment(canvas.toBuffer(), filename);
  return attach;
}

function getCaptureDifficulty(frequency) {
  let catch_difficulty = Math.ceil(Math.random()*6) + Math.ceil(Math.random()*6);
  if (frequency >= 8) {
    catch_difficulty -= 1;
  }
  if (frequency <= 5) {
    catch_difficulty += 1;
  }
  if (frequency <= 3) {
    catch_difficulty += 1;
  }
  return Math.min(catch_difficulty, 11);
}

async function getPokePic(full_path, filename, shinyShift) {
  const canvas = Canvas.createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  let img = await Canvas.loadImage(full_path);
  ctx.drawImage(img, 0, 0, 512, 512);
  if (shinyShift != 0) {
    let img_data = ctx.getImageData(0, 0, 512, 512);
    let new_img_data = ctx.getImageData(0, 0, 512, 512);
    for (let j = 0; j < 512 * 512; j++) {
      let matrix = getHueMatrix(shinyShift)
      let pos = j * 4;
      let new_rgb = applyHueMatrix(matrix, img_data.data[pos], img_data.data[pos+1], img_data.data[pos+2]);
      new_img_data.data[pos] = new_rgb[0];
      new_img_data.data[pos+1] = new_rgb[1];
      new_img_data.data[pos+2] = new_rgb[2];
    }
    ctx.putImageData(new_img_data, 0, 0)
  }
  let attach = new MessageAttachment(canvas.toBuffer(), 'poke_pic.png');
  return attach;
}

module.exports = { release_values, activate_user, deactivate_user, getValue, getOtherStat, getHPStat, mulb32, getSymb, getMult, getStats, clamp, d_to_r, getHueMatrix, applyHueMatrix, getShinyAttachment, getCaptureDifficulty, getPokePic };

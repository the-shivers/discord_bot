"use strict";

const IV = 16;
const EV = 100;

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

module.exports = { getOtherStat, getHPStat, mulb32, getSymb, getMult, getStats };

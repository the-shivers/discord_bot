"use strict";

// Define Constants
const Discord = require("discord.js");
const Canvas = require('canvas');
const f = require('../../funcs.js');
const c = require('./f_config.js');
const record_filename = './f_record.json';
const record_filename_full = './scripts/fruitymon/f_record.json';
var f_record = require(record_filename);
const fruit_dict_filename = './fruit_dict.json';
const fruit_dict_filename_full = './scripts/fruitymon/fruit_dict.json';
var fruit_dict = require(fruit_dict_filename);
const f_prices = require('./f_prices.js');
const width = 600;
const height = 400;
let num_points = 50;

function f_chart(msg, content) {

  // Pull fruit_str from whatever the heck they said
  let fruit_str = '';
  if (content.trim() in c.emoji_to_string) {
    fruit_str = c.emoji_to_string[content.trim()];
  } else if (content.trim() in fruit_dict) {
    fruit_str = content.trim()
  } else if (content.trim().toUpperCase() in c.ticker_to_string) {
    fruit_str = c.ticker_to_string[content.trim().toUpperCase()].str;
  } else {
    msg.reply("That ain't no fruit!!!")
    return ;
  }

  // Create canvas and color it
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  var grd = ctx.createLinearGradient(0, 0, 0, height);
  grd.addColorStop(0, "#112255");
  grd.addColorStop(1, "#112277");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  // Set margins, size, number of lines
  let t_border = 20;
  let r_border = 80;
  let b_border = 15;
  let l_border = 25;
  let graph_height = height - t_border - b_border;
  let graph_width = width - l_border - r_border;
  let h_lines = 5; // includes top and bottom line
  let v_lines = 8; // includes left and right line
  let scale_factor = 0.9; // Amount of vertical space line graph will occupy

  // Get dates
  let date_list = f_prices.generatePastDaysWithYears(50);
  let date_list_labels = f_prices.generatePastDays(50);

  // Get prices
  let prices = [];
  for (let i = 0; i < date_list.length; i++) {
    prices.push(fruit_dict[fruit_str].hist_prices[date_list[i]])
  }

  // Scale noisy result so its range is 10% of graph height
  let min = Math.min(...prices);
  let max = Math.max(...prices);
  let range = Math.max(50, max - min); // Can't be zero or else math gets messed up!
  // go through and subtract min from everything. Then multiply everything by
  // a scaling factor.
  let scale_mult = (scale_factor * graph_height) / range;
  let scaled_result = [];
  for (let i = 0; i < prices.length; i++) {
    let curr_val = prices[i];
    scaled_result.push((curr_val - min) * scale_mult)
  }

  // Define line values
  let new_min = min - ((range / scale_factor) * ((1 - scale_factor) / 2))
  let line_vals = []; // these will be top to bottom values!
  for (let i = 0; i < h_lines; i++) {
    let new_val = (range / scale_factor) * (i / (h_lines - 1)) + new_min;
    if (new_val < 0) {
      new_val = "-₣" + Math.abs(new_val).toFixed(2)
    } else {
      new_val = "₣" + new_val.toFixed(2)
    }
    line_vals.push(new_val);
  }
  line_vals.reverse();

  // Set font style
  ctx.font = '14px consolas';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';

  //horiz lines
  ctx.beginPath();
  ctx.strokeStyle = '#555599';
  ctx.setLineDash([5, 0]);
  for (let i = 0; i < h_lines; i++) {
    ctx.moveTo(l_border, t_border + (i * (graph_height / (h_lines - 1))));
    ctx.lineTo(width - r_border, t_border + (i * (graph_height / (h_lines - 1))));
    ctx.fillText(line_vals[i], width - r_border + 3, t_border + (i * (graph_height / (h_lines - 1))) + 7);
  }
  ctx.stroke();

  // Set font style
  ctx.textAlign = 'center';

  // vert lines
  ctx.beginPath();
  ctx.strokeStyle = '#555599';
  ctx.setLineDash([3, 6]);
  for (let i = 0; i < v_lines; i++) {
    let x_pos = l_border + (i * (graph_width / (v_lines - 1)))
    ctx.moveTo(x_pos, t_border);
    ctx.lineTo(x_pos, height - b_border);
    let curr_date = date_list_labels[i * 7]
    ctx.fillText(curr_date, x_pos, t_border - 5);
  }
  ctx.stroke();

  // Line graph
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  let current_x = l_border;
  ctx.setLineDash([5, 0]);
  ctx.moveTo(current_x, graph_height - scaled_result[0]);
  for (let i = 1; i <= 50; i++) {
    let point_distance = graph_width / (num_points - 1);
    current_x += point_distance;
    ctx.lineTo(current_x, graph_height - scaled_result[i]);
  }
  ctx.stroke();

  // Get information for embed
  let ticker = fruit_dict[fruit_str].ticker;
  let emoji = fruit_dict[fruit_str].emoji;
  let proper = fruit_str[0].toUpperCase() + fruit_str.slice(1);
  let curr_price = prices[prices.length - 1];
  let lw_price = prices[prices.length - 8];
  let lm_price = prices[prices.length - 29];
  let lw_pct = 100 * (curr_price - lw_price) / lw_price;
  let lm_pct = 100 * (curr_price - lm_price) / lm_price;

  // Create embed
  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'ticker.png');
  const embed = new Discord.MessageEmbed()
    .setTitle(`${emoji} ${proper} (${ticker}) - 7 Week Performance`)
    .setColor("#112255")
    .addField("Current Price:", `\`₣${curr_price.toFixed(2)}\``, true)
    .addField("VS. Last Week:", `\`₣${lw_price.toFixed(2)}\n${lw_pct.toFixed(1)}%\``, true)
    .addField("VS. 4 Weeks Ago:", `\`₣${lm_price.toFixed(2)}\n${lm_pct.toFixed(1)}%\``, true)
    .attachFiles(attachment)
    .setImage('attachment://ticker.png')
    .setFooter("Price updates daily.")

  // Send
  msg.channel.send(embed);
}

module.exports = {f_chart}

"use strict";

const { async_query } = require('../db/scripts/db_funcs.js')
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { identify_correct_answer, update_lifelines } = require('./wwtbam_friend.js');

const assets_dir = './assets/wwtbam/';
const audience_name = 'audience.png'
const audience_path = assets_dir + audience_name;
const audience = new MessageAttachment(audience_path, audience_name);

function f_n(int) {
  return (int == 0 ? '' : String(int));
}

function ask_the_audience(answer, q_num) {
  let prob = 1-Math.pow(((q_num + 1) / 15), 0.6) * 0.75
  let rem_letters = ['A', 'B', 'C', 'D']
  rem_letters.splice(rem_letters.indexOf(answer), 1);
  let results_obj = {'A':0, 'B':0, 'C':0, 'D':0}
  for (let i = 0; i < 10; i++) {
    if (Math.random() < prob) {
      results_obj[answer]++;
    } else {
      results_obj[rem_letters[Math.floor(Math.random()*rem_letters.length)]]++;
    }
  }
  let text = "```A: │"+'██'.repeat(results_obj.A)+' '+f_n(results_obj.A)+"0%" +
    "\nB: │"+'██'.repeat(results_obj.B)+' '+f_n(results_obj.B)+"0%" +
    "\nC: │"+'██'.repeat(results_obj.C)+' '+f_n(results_obj.C)+"0%" +
    "\nD: │"+'██'.repeat(results_obj.D)+' '+f_n(results_obj.D)+"0%```"
  const embed = new MessageEmbed()
    .setTitle(`The audience has voted!`)
    .setColor("#6622AA")
    .setThumbnail('attachment://' + audience_name)
    .setDescription(text);
  return embed;
}

module.exports = {
	async execute(interaction) {
    let answer_letter = identify_correct_answer(interaction);
    let query = "SELECT * FROM data.wwtbam_status WHERE channelId = ?";
    let values = [interaction.channelId];
    let status = await async_query(query, values);
    if (status[0].userId !== interaction.user.id) {
      interaction.reply({
        content: "You're not even playing!",
        ephemeral: true
      })
    } else if (status[0].is_available_audience === 0) {
        interaction.reply({
          content: "That lifeline isn't available!",
          ephemeral: true
        })
    } else if (status[0].is_available_audience === 1) {
      let embed = ask_the_audience(answer_letter, status[0].question_num/(3/2));
      let lifes = update_lifelines(
        interaction.message.components[1].components, 'wwtbam_audience'
      )
      interaction.update({
        components: [interaction.message.components[0], lifes]
      })
      interaction.followUp({embeds: [embed], files: [audience]})
      query = 'UPDATE data.wwtbam_status SET channelId = ?, guildId = ?, ';
      query += 'userId = ?, status = ?, question_num = ?, is_available_50_50 =';
      query += ' ?, is_available_audience = ?, is_available_friend = ?, ';
      query += 'updatedAt = ? WHERE channelId = ?;';
      values = Object.values(status[0])
      values[6] = 0;
      values.push(values[0])
      async_query(query, values);
    } else {
      console.log("You should never see this message (audience is disabled).")
    }
  }
}

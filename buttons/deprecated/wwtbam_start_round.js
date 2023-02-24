const { async_query } = require('../db/scripts/db_funcs.js')
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');

const assets_dir = './assets/wwtbam/';
const logo_name = 'wwtbam_logo.gif';
const logo = new MessageAttachment(assets_dir + logo_name, logo_name);
const diff_arr = [
  [1], [1, 2], [1, 2, 3], [2, 3], [2, 3, 4], [3, 4, 5], [4, 5], [4, 5, 6],
  [5, 6], [5, 6, 7], [6, 7], [7, 8], [8, 9], [9], [10]
];
const money_arr = [
  '$100', '$200', '$300', '$500', '$1,000', '$2,000', '$4,000', '$8,000',
  '$16,000', '$32,000', '$64,000', '$125,000', '$250,000', '$500,000',
  '$1,000,000'
];

async function start_round(interaction, status, content) {
  if (status.question_num === 15) {
    interaction.reply("Congrats! You just won \`$1,000,000\`! Nicely done!")
    let query = 'UPDATE data.wwtbam_status SET channelId = ?, guildId = ?, ';
    query += 'userId = ?, status = ?, question_num = ?, is_available_50_50 =';
    query += ' ?, is_available_audience = ?, is_available_friend = ?, ';
    query += 'updatedAt = ? WHERE channelId = ?;';
    status.userId = '0' * 18; status.status = 0;
    status.question_num = 0; status.is_available_50_50 = 1;
    status.is_available_friend = 1; status.is_available_audience = 1;
    status.updatedAt = interaction.createdAt;
    let values = Object.values(status)
    values.push(values[0])
    async_query(query, values);
    return;
  }

  let query = 'SELECT * FROM data.wwtbam_questions WHERE difficulty IN (?);'
  let values = [diff_arr[status.question_num]];
  let questions = await async_query(query, values);
  let question = questions[Math.floor(Math.random()*questions.length)]

  let disable_triggers = [
    'wwtbam_t', 'wwtbam_f1', 'wwtbam_f2', 'wwtbam_f3', 'wwtbam_quit'
  ]
  let filter = click => {
    return click.user.id === interaction.user.id
    && disable_triggers.includes(click.customId)
  };
	let wait = 3 * 60 * 1000;

  function disable_components(msg) {
    let results = [];
    for (let i = 0; i < msg.components.length; i++) {
      let new_comp = new MessageActionRow();
      let comp = msg.components[i];
      for (let j = 0; j < comp.components.length; j++) {
        new_comp.addComponents(comp.components[j].setDisabled(true))
      }
      results.push(new_comp)
    }
    return results;
  }

  interaction.reply(
		generate_embed(interaction, status, question, content)
	)
  .then(embedMessage => {
		embedMessage.channel.awaitMessageComponent({
			filter, max: 1, time: wait, errors: ['time']
		}).then(collected => {
      let new_comps = disable_components(embedMessage);
      embedMessage.edit({components: new_comps})
		}).catch(() => {
			embedMessage.delete();
			interaction.channel.send(
				'No reply after ' + (wait / 1000) + ' seconds, operation canceled.'
			).then(m => {
				setTimeout(() => m.delete(), 15 * 1000)
			});
		});
	})
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

function randomize_choices(q) {
  return shuffle([q.answer, q.wrong1, q.wrong2, q.wrong3])
}

function get_answer_index(shuffled_answers, q) {
  return shuffled_answers.findIndex(element => element === q.answer);
}

function get_formatted_choices(shuffled_answers) {
  let str = 'A. ' + shuffled_answers[0] + '\nB. ' + shuffled_answers[1]
  return str + '\nC. ' + shuffled_answers[2] + '\nD. ' + shuffled_answers[3]
}

function generate_embed(interaction, status, question, content) {
  let curr_q = status.question_num;
  let milestone = ([4, 9].includes(curr_q)) ? " (Milestone)" : "";
  let random_choices = randomize_choices(question);
  let answer_index = get_answer_index(random_choices, question);
  let formatted_choices = get_formatted_choices(random_choices)
  let wrong_ids = ['wwtbam_f1', 'wwtbam_f2', 'wwtbam_f3'];
	const embed = new MessageEmbed()
    .setTitle("The " + money_arr[curr_q] + ' Question' + milestone)
    .setColor("#6622AA")
    .addField(question.question, formatted_choices, false)
    .setThumbnail('attachment://' + logo_name)
    .setAuthor(interaction.user.username + ' wants to be a Millionaire!');
  const a_button = new MessageButton()
		.setCustomId((answer_index === 0) ? 'wwtbam_t' : wrong_ids.shift())
		.setLabel('A')
    .setStyle('PRIMARY');
  const b_button = new MessageButton()
		.setCustomId((answer_index === 1) ? 'wwtbam_t' : wrong_ids.shift())
		.setLabel('B')
    .setStyle('PRIMARY');
  const c_button = new MessageButton()
		.setCustomId((answer_index === 2) ? 'wwtbam_t' : wrong_ids.shift())
		.setLabel('C')
    .setStyle('PRIMARY');
  const d_button = new MessageButton()
		.setCustomId((answer_index === 3) ? 'wwtbam_t' : wrong_ids.shift())
		.setLabel('D')
    .setStyle('PRIMARY');
  const l_50_50 = new MessageButton()
		.setCustomId('wwtbam_50_50')
		.setLabel('50/50')
    .setDisabled(status.is_available_50_50 === 0)
    .setStyle('SECONDARY');
  const l_audience = new MessageButton()
    .setCustomId('wwtbam_audience')
    .setLabel('Ask the Audience')
    .setDisabled(status.is_available_audience === 0)
    .setStyle('SECONDARY');
  const l_friend = new MessageButton()
    .setCustomId('wwtbam_friend')
    .setLabel('Phone a Friend')
    .setDisabled(status.is_available_friend === 0)
    .setStyle('SECONDARY');
  const quit = new MessageButton()
    .setCustomId('wwtbam_quit')
    .setLabel('Quit')
    .setDisabled(false)
    .setStyle('DANGER');
  const choices = new MessageActionRow()
    .addComponents(a_button, b_button, c_button, d_button);
  const menu = new MessageActionRow()
    .addComponents(l_50_50, l_audience, l_friend, quit);
  return {
  		embeds: [embed],
  		files: [logo],
  		components: [choices, menu],
  		ephemeral: false,
  		fetchReply: true,
      content: content
  }
}




module.exports = { start_round, money_arr }

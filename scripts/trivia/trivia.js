"use strict";

// Imports
const Discord = require('discord.js');
const fs = require('fs');
const f = require('../../funcs.js');
const trivia_filename_full = './scripts/trivia/trivia.json';
const trivia_json = JSON.parse(
  fs.readFileSync(trivia_filename_full, 'utf8')
);
const questions_arr = trivia_json.questions;
const mc_questions_arr = trivia_json.mc_questions;
const all_questions = questions_arr.concat(mc_questions_arr);
const timeout = 15000
let trivia_status = 0

let full_tags = []
for(let i = 0; i < questions_arr.length; i++) {
  let obj_tags = questions_arr[i].tags;
  for(let j = 0; j < obj_tags.length; j++) {
    if (!(full_tags.includes(obj_tags[j]))) {
      full_tags.push(obj_tags[j]);
    }
  }
}

let full_mc_tags = []
for(let i = 0; i < mc_questions_arr.length; i++) {
  let obj_tags = mc_questions_arr[i].tags;
  for(let j = 0; j < obj_tags.length; j++) {
    if (!(full_mc_tags.includes(obj_tags[j]))) {
      full_mc_tags.push(obj_tags[j]);
    }
  }
}

//TO DO:
//EDIT DISTANCE OF ALL ANSWERS FOR FILL IN BLANK
//put status in json probs
//MILLIONAIRE
//QUESTIONS
  // pokemon pokedex entries
  // pokemon silhouettes
  // national capitals
  // national outlines
  // us states
  // us capitals
  // vocabulary


function parse_trivia_args(msg, content) {
  let content_arr = content.split(' ');
  content_arr.shift();
  if (content_arr.length === 0) {
    return [10, content_arr]
  } else if (content_arr[0].trim() === 'tags') {
    return ["tags", []];
  } else if (content_arr[0].trim() === 'end') {
    return ["end", []];
  } else if (f.isNumeric(content_arr[0])) {
    let rounds = parseInt(content_arr.shift());
    return [rounds, content_arr]
  } else {
    return ["error", []];
  }
}


function parse_tags(content, trivia_type) {
  if (trivia_type === 'mc') {
    var relevant_tags = full_mc_tags.slice();
  } else {
    var relevant_tags = full_tags.slice();
  }
  let excl_tags = [];
  let incl_tags = [];
  let err_tags = []
  for(let i = 0; i < content.length; i++) {
    let curr_tag = content[i].trim().toLowerCase()
    if (relevant_tags.includes(curr_tag) || relevant_tags.includes(curr_tag.slice(1))) {
      if (curr_tag[0] === '-') {
        excl_tags.push(curr_tag.slice(1));
      } else {
        incl_tags.push(curr_tag)
      }
    } else {
      err_tags.push(curr_tag)
    }
  }
  return [excl_tags, incl_tags, err_tags];
}


function get_filter_tags(excl_tags, incl_tags, trivia_type) {
  if (trivia_type === 'mc') {
    var relevant_tags = full_mc_tags.slice();
  } else {
    var relevant_tags = full_tags.slice();
  }
  if (incl_tags.length > 0 && excl_tags.length > 0) {
    return [excl_tags, incl_tags];
  } else if (incl_tags.length > 0) {
    return [[], relevant_tags.filter(value => incl_tags.includes(value))];
  } else if (excl_tags.length > 0) {
    return [excl_tags, relevant_tags];
  } else {
    return [[], relevant_tags];
  }
}


function get_filtered_questions(excl, incl, questions_arr, trivia_type) {
  if (trivia_type === 'mc') {
    var relevant_qs = mc_questions_arr.slice();
  } else {
    var relevant_qs = questions_arr.slice();
  }
  let new_questions = [];
  let incl_flag = false;
  for (let i = 0; i < relevant_qs.length; i++) {
    incl_flag = false;
    for (let j = 0; j < relevant_qs[i].tags.length; j++) {
      if (excl.includes(relevant_qs[i].tags[j])) {
        incl_flag = false;
        break;
      } else if (incl.includes(relevant_qs[i].tags[j])) {
        incl_flag = true;
      }
    }
    if (incl_flag === true) {
      new_questions.push(relevant_qs[i]);
    }
  }
  return new_questions;
}


function format_tag_list(tag_list) {
  let return_str = '';
  for (let i = 0; i < tag_list.length; i++) {
    return_str += '`' + tag_list[i] + '`, '
  }
  return return_str.slice(0, -2);
}


function update_scoreboard(name_str, scoreboard) {
  // Fill-in-the-blank only
  if (name_str in scoreboard) {
    scoreboard[name_str]++;
  } else {
    scoreboard[name_str] = 1;
  }
  return scoreboard;
}


function start_round(msg, qs_remaining, questions, scoreboard, rounds) {
  // Fill-in-the-blank only
  if (qs_remaining === 0) {
    msg.channel.send("Game over! Here are the scores.\n" + format_scores(scoreboard));
    trivia_status = 0
    return;
  }
  let curr_q = questions[Math.floor(Math.random() * questions.length)];
  questions = questions.filter(item => item !== curr_q);
  qs_remaining--;
  const filter = response => {
  	return curr_q.answers.some(
      answer => answer.toLowerCase() === response.content.toLowerCase()
    );
  };
  let q_text = rounds - qs_remaining + ". " + curr_q.question;
  if ('image' in curr_q) {
    msg.channel.send({
      content: q_text,
      files: [{
        attachment: './scripts/trivia/assets/'+ curr_q.image,
        name: 'file.png'
      }]
    })
  } else {
    msg.channel.send(q_text)
  }
  setTimeout(start_round, timeout, msg, qs_remaining, questions, scoreboard, rounds);
	msg.channel.awaitMessages({ filter, max: 1, time: timeout - 1000, errors: ['time'] })
		.then(collected => {
      let winner = collected.first().author;
			msg.channel.send(`${winner} got the correct answer!`);
      scoreboard = update_scoreboard(winner.username, scoreboard);
		})
		.catch(collected => {
			msg.channel.send('Looks like nobody got the answer this time. (It was `' + curr_q.answers[0] + '`.)');
		});
}


async function gather_reacs(msg) {
  let allowed_emojis = ['🇦', '🇧', '🇨', '🇩'];
  let promise_arr = [];
  let reacs_obj = {};
  let user_arrays = await Promise.all([
    msg.reactions.cache.get('🇦').users.fetch(),
    msg.reactions.cache.get('🇧').users.fetch(),
    msg.reactions.cache.get('🇨').users.fetch(),
    msg.reactions.cache.get('🇩').users.fetch()
  ]);
  for (let i = 0; i < allowed_emojis.length; i++) {
    reacs_obj[allowed_emojis[i]] = [];
    let user_arr = Array.from(user_arrays[i].values());
    for (let j = 0; j < user_arr.length; j++) {
      reacs_obj[allowed_emojis[i]].push(user_arr[j].username);
    }
  }
  return reacs_obj
}


async function update_mc_scoreboard(q_msg, answer_emoji, scoreboard) {

  let reacs_obj = await gather_reacs(q_msg)
  let winners = new Set();
  let losers = new Set();
  let final_winners_str = '';
  for (let [key, value] of Object.entries(reacs_obj)) {
    for (let j = 0; j < value.length; j++) {
      if (key === answer_emoji) {
        winners.add(value[j]);
      } else {
        losers.add(value[j]);
      }
    }
  }
  winners.forEach((x) => {
    if (!(losers.has(x))) {
      final_winners_str += ('`' + x + '`, ');
      if (x in scoreboard) {
        scoreboard[x]++;
      } else {
        scoreboard[x] = 1;
      }
    }
  })
  if (final_winners_str.length > 0) {
    q_msg.channel.send("The answer was " + answer_emoji + "! Congrats to " +
    final_winners_str.slice(0, -2) + "!");
  } else {
    q_msg.channel.send("The answer was " + answer_emoji +
    "! Too bad nobody got it!");
  }

  return scoreboard;
}


function f_timeout(ms) {
  // MC only
  return new Promise(resolve => setTimeout(resolve, ms));
}


function randomize_answers(question) {
  // Returns index of correct answer and formatted string of randomized answers
  let true_answer = question.answers[0];
  let rand_arr = f.shuffle(question.answers);
  let answer_str = '🇦 - ' + rand_arr[0] + '\n';
  answer_str += '🇧 - ' + rand_arr[1] + '\n';
  answer_str += '🇨 - ' + rand_arr[2] + '\n';
  answer_str += '🇩 - ' + rand_arr[3];
  return [['🇦', '🇧', '🇨', '🇩'][rand_arr.indexOf(true_answer)], answer_str]
}


async function start_mc_round(msg, qs_remaining, questions, scoreboard, rounds) {
  if (qs_remaining === 0) {
    msg.channel.send("Game over! Here are the scores.\n" + format_scores(scoreboard));
    trivia_status = 0
    return;
  }
  let curr_q = questions[Math.floor(Math.random() * questions.length)];
  questions = questions.filter(item => item !== curr_q);
  qs_remaining--;
  let answers = randomize_answers(curr_q);
  let msg_str = rounds - qs_remaining + ". " + curr_q.question + "\n" + answers[1];
  if ('image' in curr_q) {
    var q_msg = await msg.channel.send({
      content: msg_str,
      files: [{
        attachment: './scripts/trivia/assets/'+ curr_q.image,
        name: 'file.png'
      }]
    })
  } else {
    var q_msg = await msg.channel.send(msg_str);
  }
	q_msg.react('🇦')
    .then(() => q_msg.react('🇧'))
		.then(() => q_msg.react('🇨'))
    .then(() => q_msg.react('🇩'))
    .then(() => f_timeout(timeout))
    .then(() => {
      var results = update_mc_scoreboard(q_msg, answers[0], scoreboard)
      Promise.all([f_timeout(2000), results]).then(
        v => start_mc_round(msg, qs_remaining, questions, v[1], rounds)
      )
    });
};


function format_scores(scoreboard) {
  if (Object.keys(scoreboard).length === 0) {
    return "Nobody scored. Better luck next time!";
  }
  let result = '';
  let winner = Object.keys(scoreboard).reduce(
    (a, b) => scoreboard[a] > scoreboard[b] ? a : b
  );
  for (const [key, value] of Object.entries(scoreboard)) {
    result += key + ": `" + value + "`\n" ;
  }
  result += winner + " was the winner!";
  return result;
}


function trivia(msg, content) {
  let parsed_args = parse_trivia_args(msg, content);
  if (parsed_args[0] === "tags") {
    let formatted_tags = format_tag_list(full_tags)
    msg.channel.send("All trivia tags: " + formatted_tags);
  } else if (trivia_status === 1) {
    if (parsed_args[0] === "end") {
      msg.channel.send("Trivia game ended.\n" + format_scores(scoreboard));
      trivia_status = 0
    } else {
      msg.channel.send("A game is already going! Try !trivia end");
    }
  } else if (parsed_args[0] === "end") {
      msg.channel.send("Try starting a game before ending one!");
  } else if (parsed_args[0] === "error") {
    msg.channel.send("The first argument after !trivia must be an integer.");
  } else if (parsed_args[0] > 30) {
    msg.channel.send("Too many! Keep it at 30 rounds or less please.");
  } else {
    //trivia_status = 1
    let tags_arr = parse_tags(parsed_args[1], 'normal');
    let filter_tags = get_filter_tags(tags_arr[0], tags_arr[1], 'normal');
    let questions = get_filtered_questions(filter_tags[0], filter_tags[1], questions_arr, 'normal');
    if (parsed_args[0] > questions.length) {
      msg.channel.send("Error! Not enough questions.")
      return;
    }
    let all_tags = new Set()
    for (let i = 0; i < questions.length; i++) {
      questions[i].tags.forEach(item => all_tags.add(item))
    }
    let formatted_tags = format_tag_list(Array.from(all_tags))
    msg.channel.send("Running trivia for " + parsed_args[0] + " rounds.")
    msg.channel.send("Tags included this game: " + formatted_tags);
    let q_const = parsed_args[0]
    start_round(msg, q_const, questions, {}, q_const);
  }
}


function mc_trivia(msg, content) {
  let parsed_args = parse_trivia_args(msg, content);
  if (parsed_args[0] === "tags") {
    let formatted_tags = format_tag_list(full_tags)
    msg.channel.send("All trivia tags: " + formatted_tags);
  } else if (trivia_status === 1) {
    if (parsed_args[0] === "end") {
      msg.channel.send("Trivia game ended.\n" + format_scores(scoreboard));
      trivia_status = 0
    } else {
      msg.channel.send("A game is already going! Try !trivia end");
    }
  } else if (parsed_args[0] === "end") {
      msg.channel.send("Try starting a game before ending one!");
  } else if (parsed_args[0] === "error") {
    msg.channel.send("The first argument after !trivia must be an integer.");
  } else if (parsed_args[0] > 30) {
    msg.channel.send("Too many! Keep it at 30 rounds or less please.");
  } else {
    //trivia_status = 1
    let tags_arr = parse_tags(parsed_args[1], 'mc');
    let filter_tags = get_filter_tags(tags_arr[0], tags_arr[1], 'mc');
    let questions = get_filtered_questions(filter_tags[0], filter_tags[1], questions_arr, 'mc');
    if (parsed_args[0] > questions.length) {
      msg.channel.send("Error! Not enough questions.")
      return;
    }
    let all_tags = new Set()
    for (let i = 0; i < questions.length; i++) {
      questions[i].tags.forEach(item => all_tags.add(item))
    }
    let formatted_tags = format_tag_list(Array.from(all_tags))
    msg.channel.send("Running trivia for " + parsed_args[0] + " rounds.")
    msg.channel.send("Tags included this game: " + formatted_tags);
    let q_const = parsed_args[0]
    start_mc_round(msg, q_const, questions, {}, q_const);
  }
}



module.exports = { trivia, mc_trivia };

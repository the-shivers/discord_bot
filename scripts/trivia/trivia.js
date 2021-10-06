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
const timeout = 10000


//TO DO:
//EDIT DISTANCE OF ALL ANSWERS FOR FILL IN BLANK
//REACTIONS FOR MC
//MC
//MILLIONAIRE
//QUESTIONS


let full_tags = []
for(let i = 0; i < questions_arr.length; i++) {
  let obj_tags = questions_arr[i].tags;
  for(let j = 0; j < obj_tags.length; j++) {
    if (!(full_tags.includes(obj_tags[j]))) {
      full_tags.push(obj_tags[j]);
    }
  }
}




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


function parse_tags(content) {
  let excl_tags = [];
  let incl_tags = [];
  let err_tags = []
  for(let i = 0; i < content.length; i++) {
    let curr_tag = content[i].trim().toLowerCase()
    if (full_tags.includes(curr_tag) || full_tags.includes(curr_tag.slice(1))) {
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


function get_filter_tags(excl_tags, incl_tags) {
  if (incl_tags.length > 0) {
    // In this case, we only care about the tags explicitly asked to be included
    return incl_tags;
  } else if (excl_tags.length > 0) {
    return full_tags.filter(value => !excl_tags.includes(value));
  } else {
    return full_tags
  }
}

function get_filtered_questions(tags, questions_arr) {
  let new_questions = [];
  for (let i = 0; i < questions_arr.length; i++) {
    let curr_question = questions_arr[i];
    for (let j = 0; j < curr_question.tags.length; j++) {
      if (tags.includes(curr_question.tags[j])) {
        new_questions.push(curr_question);
        break;
      }
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
  if (name_str in scoreboard) {
    scoreboard[name_str]++;
  } else {
    scoreboard[name_str] = 1;
  }
  return scoreboard;
}

function start_round(msg, qs_remaining, questions, scoreboard, rounds) {
  if (qs_remaining === 0) {
    msg.channel.send("Game over! Here's the scores.\n" + format_scores(scoreboard));
    trivia_json.status = 0
    fs.writeFile(
      trivia_filename_full,
      JSON.stringify(trivia_json, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );
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
  msg.channel.send(
    rounds - qs_remaining + ". " + curr_q.question
  )
	.then(() => {
    setTimeout(start_round, timeout, msg, qs_remaining, questions, scoreboard, rounds);
		msg.channel.awaitMessages({ filter, max: 1, time: timeout - 1000, errors: ['time'] })
			.then(collected => {
        let winner = collected.first().author;
				msg.channel.send(`${winner} got the correct answer!`);
        scoreboard = update_scoreboard(winner.username, scoreboard);
			})
			.catch(collected => {
				msg.channel.send('Looks like nobody got the answer this time.');
			});
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
  console.log('here is reacs obj')
  return reacs_obj
}

async function update_mc_scoreboard(q_msg, answer_emoji, scoreboard) {
  q_msg.channel.send("answer is " + answer_emoji);
  let reacs_obj = await gather_reacs(q_msg)
  let winners = new Set();
  let losers = new Set();
  let final_winners = [];
  for (let [key, value] of Object.entries(reacs_obj)) {
    for (let j = 0; j < value.length; j++) {
      if (key === answer_emoji) {
        winners.add(value[j]);
      } else {
        losers.add(value[j]);
      }
    }
  }
  console.log('winners', Array.from(winners));
  console.log('losers', Array.from(losers));
  winners.forEach((x) => {
    if (!(losers.has(x))) {
      final_winners.push(x);
      if (x in scoreboard) {
        scoreboard[x]++;
      } else {
        scoreboard[x] = 1;
      }
    }
  })
  console.log('le final winners', final_winners);
  return [scoreboard, final_winners];
}

function f_timeout(ms) {
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
  console.log('Start of start_mc_round. Scoreboard is: ', scoreboard)
  if (qs_remaining === 0) {
    msg.channel.send("Game over! Here's the scores.\n" + format_scores(scoreboard));
    trivia_json.status = 0
    fs.writeFile(
      trivia_filename_full,
      JSON.stringify(trivia_json, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );
    return;
  }
  let curr_q = questions[Math.floor(Math.random() * questions.length)];
  questions = questions.filter(item => item !== curr_q);
  qs_remaining--;

  let answers = randomize_answers(curr_q);
  let msg_str = qs_remaining + ". " + curr_q.question + "\n" + answers[1];
  let q_msg = await msg.channel.send(msg_str);
	q_msg.react('🇦')
    .then(() => q_msg.react('🇧'))
		.then(() => q_msg.react('🇨'))
    .then(() => q_msg.react('🇩'))
    .then(() => f_timeout(3000))
    .then(() => {
      console.log('Just before update_mc_scoreboard: ', scoreboard)
      var results = update_mc_scoreboard(q_msg, answers[0], scoreboard)
      console.log('Just after update_mc_scoreboard, results: ', results)
      // Promise.all([f_timeout(3000), results]).then(() => {
      //   console.log('After another promise wait, heres results:', results);
      //   console.log(results);
      //   console.log(results[0]);
      //   console.log(results.data)
      //   setTimeout(start_mc_round, timeout, msg, qs_remaining, questions, results[0], rounds);
      // })
      Promise.all([f_timeout(2000), results]).then(
        v => {
          console.log(v[1]);
          start_mc_round(msg, qs_remaining, questions, v[1][0], rounds);
        })
    });



    //
    //     () => {
    //     console.log('After another promise wait, heres results:', results);
    //     console.log(results);
    //     console.log(results[0]);
    //     console.log(results.data)
    //     setTimeout(start_mc_round, timeout, msg, qs_remaining, questions, results[0], rounds);
    //   })
    // })

};

function format_scores(scoreboard) {
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
  } else if (trivia_json.status === 1) {
    if (parsed_args[0] === "end") {
      msg.channel.send("Trivia game ended.\n" + format_scores(scoreboard));
      trivia_json.status = 0
      fs.writeFile(
        trivia_filename_full,
        JSON.stringify(trivia_json, null, 2),
        function writeJSON(err) {
          if (err) return console.log(err);
        }
      );
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
    trivia_json.status = 1
    fs.writeFile(
      trivia_filename_full,
      JSON.stringify(trivia_json, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );
    let tags_arr = parse_tags(parsed_args[1]);
    let filter_tags = get_filter_tags(tags_arr[0], tags_arr[1]);
    let questions = get_filtered_questions(filter_tags, questions_arr);
    let formatted_tags = format_tag_list(filter_tags)
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
  } else if (trivia_json.status === 1) {
    if (parsed_args[0] === "end") {
      msg.channel.send("Trivia game ended.\n" + format_scores(scoreboard));
      trivia_json.status = 0
      fs.writeFile(
        trivia_filename_full,
        JSON.stringify(trivia_json, null, 2),
        function writeJSON(err) {
          if (err) return console.log(err);
        }
      );
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
    //trivia_json.status = 1
    fs.writeFile(
      trivia_filename_full,
      JSON.stringify(trivia_json, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );
    let tags_arr = parse_tags(parsed_args[1]);
    let filter_tags = get_filter_tags(tags_arr[0], tags_arr[1]);
    let questions = get_filtered_questions(filter_tags, mc_questions_arr);
    let formatted_tags = format_tag_list(filter_tags)
    msg.channel.send("Running trivia for " + parsed_args[0] + " rounds.")
    msg.channel.send("Tags included this game: " + formatted_tags);
    let q_const = parsed_args[0]
    start_mc_round(msg, q_const, questions, {}, q_const);
  }
}



module.exports = { trivia, mc_trivia };

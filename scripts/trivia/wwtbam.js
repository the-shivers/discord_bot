"use strict";

// Imports
const Discord = require('discord.js');
const fs = require('fs');
const f = require('../../funcs.js');
const trivia_filename_full = './scripts/trivia/trivia.json';
const trivia_json = JSON.parse(
  fs.readFileSync(trivia_filename_full, 'utf8')
);
const questions_arr = trivia_json.mc_questions;
let trivia_status = 0

const regis_path = './scripts/trivia/assets/regis.png';
const regis_name = 'regis.png'
const logo_path = './scripts/trivia/assets/wwtbam_logo.gif';
const logo_name = 'wwtbam_logo.gif'
const cletus_path = './scripts/trivia/assets/cletus.png';
const cletus_name = 'cletus.png'
const owl_path = './scripts/trivia/assets/owl.png';
const owl_name = 'owl.png'
const zodiac_path = './scripts/trivia/assets/zodiac.png';
const zodiac_name = 'zodiac.png'
const audience_path = './scripts/trivia/assets/audience.png';
const audience_name = 'audience.png'
const regis = new Discord.MessageAttachment(regis_path, regis_name);
const logo = new Discord.MessageAttachment(logo_path, logo_name);
const cletus = new Discord.MessageAttachment(cletus_path, cletus_name);
const zodiac = new Discord.MessageAttachment(zodiac_path, zodiac_name);
const owl = new Discord.MessageAttachment(owl_path, owl_name);
const audience = new Discord.MessageAttachment(audience_path, audience_name);
const diff_arr = [
  [1], [1, 2], [1, 2, 3], [2, 3, 4], [3, 4], [4, 5], [4, 5, 6], [5, 6, 7],
  [6, 7], [7, 8], [7, 8], [7, 8], [8, 9], [9], [10]
];
const money_arr = [
  '$100', '$200', '$300', '$500', '$1,000', '$2,000', '$4,000', '$8,000',
  '$16,000', '$32,000', '$64,000', '$125,000', '$250,000', '$500,000',
  '$1,000,000'
];


function get_question(difficulties) {
  let filtered_qs = questions_arr.filter(
    question => difficulties.includes(question.difficulty)
  );
  return filtered_qs[Math.floor(Math.random() * filtered_qs.length)];
}

function randomize_answers(question) {
  // Returns index of correct answer and formatted string of randomized answers
  let true_answer = question.answers[0];
  let rand_arr = f.shuffle(question.answers);
  let answer_str = 'A. ' + rand_arr[0] + '\n';
  answer_str += 'B. ' + rand_arr[1] + '\n';
  answer_str += 'C. ' + rand_arr[2] + '\n';
  answer_str += 'D. ' + rand_arr[3];
  return [['$a', '$b', '$c', '$d'][rand_arr.indexOf(true_answer)], answer_str]
}

function format_lifelines(embed, lifelines) {
  if (lifelines["50/50"]) {
    embed.addField('50/50', 'Available. Eliminate half the choices. Simply say \
      `$50/50` to use the lifeline.', true);
  } else {
    embed.addField('50/50', 'Unavailable!', true);
  }
  if (lifelines["Phone"]) {
    embed.addField('Phone a friend', 'Available. Call a friend. Works well on \
      all questions, but the friend you call is random. Simply say \
      `$phone a friend` to use the lifeline.', true);
  } else {
    embed.addField('Phone a friend', 'Unavailable!', true);
  }
  if (lifelines["Audience"]) {
    embed.addField('Ask the audience', 'Available. Poll the audience for info. \
      They tend to perform better on easier questions. Say `$ask the audience` \
      to use the lifeline.', true);
  } else {
    embed.addField('Ask the audience', 'Unavailable!', true);
  }
}

function get_valid_responses(lifelines, resp_arr) {
  resp_arr.push('$quit');
  if (lifelines['50/50']) resp_arr.push('$50/50')
  if (lifelines['Phone']) resp_arr.push('$phone a friend')
  if (lifelines['Audience']) resp_arr.push('$ask the audience')
  return resp_arr;
}


function strike_50_50_answers(answer_str, answer_choices) {
  answer_str = answer_str.slice(0, answer_str.search("\nC. ")) + "~~" + answer_str.slice(answer_str.search("\nC. "));
  if (answer_choices.includes('$c')) {
    answer_str = '~~' + answer_str;
  } else {
    answer_str += '~~';
  }
  return answer_str;
}

function get_winnings(curr_q) {
  if (curr_q >= 10) {
    return '$32,000';
  } else if (curr_q >= 5) {
    return '$1,000';
  } else {
    return '$0';
  }
}


function call_a_friend(msg, correct_answer) {
  let luck_val = Math.random();
  let answer = correct_answer.replace("$", "").toUpperCase();
  let rem_letters = ['A', 'B', 'C', 'D']
  rem_letters.splice(rem_letters.indexOf(answer), 1);
  if (luck_val < .2) {
    let identified_answer = rem_letters[Math.floor(Math.random()*rem_letters.length)]
    var flavor_text = `You decide to call your middle school buddy, Cletus.\
    He picks up the phone and you can barely make out what he's saying. It\
    sounds like he's in an argument with his wife, and neither of them sound\
    sober. Eventually he calms down enough for you to explain the situation\
    and read the question to him.

    _"Look buddy. I ain't some kinda know-a-lot guy, but all I know is it's\
    definitely not ` + identified_answer + ".\"_";
    var file = cletus;
    var filename = cletus_name;
  } else if (luck_val < .75) {
    if (['B', 'C'].includes(answer)) {
      var identified_answers = 'B or C'
    } else {
      var identified_answers = 'A or D'
    }
    var flavor_text = `You decide to call your pen pal, the Zodiac Killer. He\
    picks up and all you can hear is deep breathing and what sounds like latin.\
    Suddenly he shouts out a sequence of letters and symbols:\

    _"+ H E R < V ¶ A + ⌖ P X < ∧ B R O + X H ⌖"_

    He then makes a loud kissing noise and hangs up. You know from your\
    correspondence with him that this means he's confident the answer is\
    ` + identified_answers + '.';
    var file = zodiac;
    var filename = zodiac_name;
  } else {
    if (Math.random() <= 1) {
      var identified_answer = answer;
    } else {
      var identified_answer = rem_letters[Math.floor(Math.random()*rem_letters.length)];
    }
    var flavor_text = `You decide to call your ophthalmologist, Hooty the\
    talking owl. He claims to be in the middle of an important surgery, but\
    you promise to give him a dead field mouse if he helps you and he\
    reluctantly agrees.

    _"Well," he begins, "you certainly called the right owl! I happened to\
    study this subject greatly when I was a hatchling, and I'm something of an\
    expert! Absolutely, unequivocally and without a single doubt, the answer\
    must be ` + identified_answer + ".\"_";
    var file = owl;
    var filename = owl_name;
  }
  const embed = new Discord.MessageEmbed()
    .setTitle(`Phoning a friend`)
    .setColor("#6622AA")
    .setThumbnail('attachment://' + filename)
    .setDescription(flavor_text);
  msg.channel.send({ embeds: [embed], files: [file] });
}


function ask_the_audience(msg, correct_response, difficulty) {
  let prob = 1-Math.pow((difficulty/10),0.6)*0.75
  let answer = correct_response.replace("$", "").toUpperCase();
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
  let text = "```A: " + '|||'.repeat(results_obj.A) + ' ' + results_obj.A + "0%" +
    "\nB: " + '|||'.repeat(results_obj.B) + ' ' + results_obj.B + "0%" +
    "\nC: " + '|||'.repeat(results_obj.C) + ' ' + results_obj.C + "0%" +
    "\nD: " + '|||'.repeat(results_obj.D) + ' ' + results_obj.D + "0%```"
  const embed = new Discord.MessageEmbed()
    .setTitle(`The audience has voted!`)
    .setColor("#6622AA")
    .setThumbnail('attachment://' + audience_name)
    .setDescription(text);
  msg.channel.send({ embeds: [embed], files: [audience] });
}


function wwtbam(msg, content) {
  if (content.trim() === 'wwtbam') {
    // Show them what the game is and how to start.
    const embed = new Discord.MessageEmbed()
      .setTitle(`${msg.author.username} wants to be a millionaire!`)
      .setColor("#6622AA")
      .addField('50/50', 'Eliminate half the answers. Simple.', true)
      .addField("Phone a friend", 'Call a friend for advice. Good on all \
        questions, but not all your friends are very reliable.', true)
      .addField("Ask the audience", 'Poll the audience. More reliable on easy \
        questions.', true)
      .setDescription('Welcome to Who Wants to Be a Millionaire! I\'m your \
        host, Regis Philbin. To win one million dollars, you\'ll have to \
        answer 15 questions correctly in a row, winning more and more money \
        with each correct answer. If you get one wrong, you\'ll lose \
        everything after the last milestone you hit. You can leave at any time \
        to keep what you\'ve won, and you also have three lifelines to help \
        you (described below). When you\'re ready, type \`!wwtbam start\`.')
      .setThumbnail('attachment://' + logo_name)
      .setImage('attachment://' + regis_name);
    msg.channel.send({ embeds: [embed], files: [regis, logo] });
  } else if (content.trim() === 'wwtbam start') {
    let lifelines = {
      "50/50": true,
      "Phone": true,
      "Audience": true
    }
    wwtbam_round(msg, lifelines, 0, ['$a', '$b', '$c', '$d']);
  }
}

function wwtbam_round(msg, lifeline_obj, curr_q, answer_choices,
  lifeline='none', last_question={}, answer_arr=[]) {
  if (curr_q >= 15) {
    msg.channel.send('Congrats! You just won a million dollars!');
    return;
  }
  let player_id = msg.author.id;
  if (lifeline === 'none') {
    let curr_difficulties = diff_arr[curr_q];
    var question = get_question(curr_difficulties);
    answer_arr = randomize_answers(question);
  } else {
    var question = last_question;
    if (lifeline === '50/50') {
      answer_arr[1] = strike_50_50_answers(answer_arr[1], answer_choices);
    }
  }
  let correct_response = answer_arr[0]; // Includes $
  let valid_responses = get_valid_responses(lifeline_obj, answer_choices);
  let milestone = ([4, 9].includes(curr_q)) ? " (Milestone)" : "";
  const embed = new Discord.MessageEmbed()
    .setTitle("The " + money_arr[curr_q] + ' Question' + milestone)
    .setColor("#6622AA")
    .addField(question.question, answer_arr[1], false)
    .setThumbnail('attachment://' + logo_name);
  format_lifelines(embed, lifeline_obj);
  embed.addField(
    "\u200b", "Answer using `$A`, `$B` or similar. Quit with `$quit`", false);
  msg.channel.send({ embeds: [embed], files: [logo] });
  function filter(msg) {
    return valid_responses.includes(
      msg.content.toLowerCase().trim()
    ) && msg.author.id === player_id;
  }
	msg.channel.awaitMessages({ filter, max: 1, time: 1000 * 180, errors: ['time'] })
		.then(collected => {
      let response = collected.first().content.toLowerCase().trim();
      if (response === correct_response) {
        msg.channel.send('Bingo! You just won ' + money_arr[curr_q] + "!");
        wwtbam_round(msg, lifeline_obj, curr_q + 1, ['$a', '$b', '$c', '$d']);
      } else if (response === '$50/50') {
        lifeline_obj['50/50'] = false;
        if (['$a', '$b'].includes(correct_response)) {
          msg.channel.send("It's either A or B.")
          wwtbam_round(msg, lifeline_obj, curr_q, ['$a', '$b'], '50/50', question, answer_arr)
        } else {
          msg.channel.send("It's either C or D.")
          wwtbam_round(msg, lifeline_obj, curr_q, ['$c', '$d'], '50/50', question, answer_arr)
        }
      } else if (response === '$phone a friend') {
        lifeline_obj['Phone'] = false;
        call_a_friend(msg, correct_response);
        wwtbam_round(msg, lifeline_obj, curr_q, ['$a', '$b', '$c', '$d'], 'Phone', question, answer_arr)
      } else if (response === '$ask the audience') {
        lifeline_obj['Audience'] = false;
        ask_the_audience(msg, correct_response, question.difficulty);
        wwtbam_round(msg, lifeline_obj, curr_q, ['$a', '$b', '$c', '$d'], 'Audience', question, answer_arr)
      } else if (response === '$quit') {
        let winnings = (curr_q > 0) ? money_arr[curr_q - 1] : "$0";
        msg.channel.send("You chickened out! Correct answer was `" + answer_arr[0] + "`. Enjoy your " + winnings + "!")
        return;
      } else {
        let winnings = get_winnings(curr_q);
        msg.channel.send("I'm sorry, the correct answer was `" + answer_arr[0] + "`. Enjoy your " + winnings + " and better luck next time!")
        return;
      }
		})
		.catch(collected => {
			msg.channel.send('Sorry, you took too long to answer! No money for you!');
		});
}

module.exports = { wwtbam };

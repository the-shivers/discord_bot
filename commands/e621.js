"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const api_options = require("../api_keys.json").e621
const f = require('../funcs.js');

function parseTags(tags) {
  let encoded = tags.replaceAll(' ', '+');
  encoded = encoded.replaceAll(':', '%3A');
  encoded = encoded.replaceAll('/', '%2F');
  encoded = encoded.replaceAll('(', '%28');
  encoded = encoded.replaceAll(')', '%29');
  return encoded

}

module.exports = {
  type: "private",
  cat: "utility",
  desc: "Search e621.",
	data: new SlashCommandBuilder()
		.setName('e621')
		.setDescription('Search e621.')
    .addStringOption(option => option
      .setName('tags')
      .setDescription('Tags to search for, space-separated.')
    ),
	async execute(interaction) {
    await interaction.deferReply()
    let tags = '';
    if (!(interaction.options.getString('tags') == null)) {
      tags = interaction.options.getString('tags');
    }
    let full_url = api_options.url + "?tags=" + parseTags(tags) + "&limit=3" + '&login=' + api_options.form.login + '&api_key=' + api_options.key
    axios({
      method: 'get',
      url: full_url,
      headers: api_options.headers
    })
      .then(response => {
        if (
          'data' in response
          && 'posts' in response.data
          && response.data.posts.length > 0
        ) {
          let post = f.shuffle(response.data.posts)[0];
          console.log(post)
          interaction.editReply(post.file.url ?? 'File was missing. Was it because you were looking for something naughty?')
        } else {
          interaction.editReply("e621 messed it up (no posts found)!")
        }
      })
      .catch(error => {
        console.log("Error is:\n", error)
        interaction.editReply("e621 messed it up!")
      });
  }
}

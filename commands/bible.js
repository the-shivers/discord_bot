// TO DO: Catch errors from things like negative integers
// Add missing books (e.g. bel and the dragon)
// Make it get books more intelligently by name or initial

"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const f = require('../funcs.js');
const assets_dir = '';
let books = require('../assets/bible/books.json');

module.exports = {
	type: "private",
  cat: "utility",
  desc: "Fetch a bible verse.",
	data: new SlashCommandBuilder()
		.setName('bible')
		.setDescription('Fetch a random or specific bible verse.')
    .addStringOption(option => option
      .setName('book')
      .setDescription('Book to read from (e.g. John in John 3:16).')
    ).addIntegerOption(option => option
      .setName('chapter')
      .setDescription('Chapter of book (e.g. 3 in John 3:16).')
    ).addIntegerOption(option => option
      .setName('verse')
      .setDescription('Verse of chapter (e.g. 16 in John 3:16).')
    ).addStringOption(option => option
      .setName('version')
      .setDescription('Bible version (default: World English Bible).')
      .addChoices({name:'Clementine Latin Vulgate', value:'clementine'}).addChoices({name:'Basic English', value:'bbe'})
      .addChoices({name:'King James', value:'kjv'}).addChoices({name:'World English Bible', value:'web'})
    ),
	async execute(interaction) {
		await interaction.deferReply();
    let version = interaction.options.getString('version') ?? 'web';
    let book, chapter, verse;
    let book_obj = {};
    let chapter_obj = {};

    // Get book object from JSON.
    let book_found = false;
    if (!(interaction.options.getString('book') == null)) {
      book = interaction.options.getString('book').trim().toLowerCase();
      let list = ""
      for (let i = 0; i < books.length; i++) {
        list += `\`${books[i].abbr.trim().toLowerCase()}\`, `
        if (
          books[i].book.trim().toLowerCase() == book ||
          books[i].abbr.trim().toLowerCase() == book
        ) {
          book_obj = books[i];
          book_found = true;
          break;
        }
      }
      if (!book_found) {
        interaction.editReply(`Couldn't find that book! Try one of ${list.slice(0,-2)}.`)
        return;
      }
    } else {
			book_obj = books[Math.floor(Math.random() * books.length)]
    }
    book = book_obj.abbr.trim().toLowerCase();

    // Repeat for chapter
    if (!(interaction.options.getInteger('chapter') == null)) {
      chapter = interaction.options.getInteger('chapter');
      console.log("RAW CHAPTER IS", chapter)
      if (chapter <= book_obj.chapters.length) {
        chapter_obj = book_obj.chapters[chapter - 1];
      } else {
				chapter_obj = book_obj.chapters[Math.floor(Math.random() * book_obj.chapters.length)]
      }
    } else {
			chapter_obj = book_obj.chapters[Math.floor(Math.random() * book_obj.chapters.length)]
    }
    chapter = parseInt(chapter_obj.chapter);
    console.log("AFTERWARDS CHATPER OBJ", chapter_obj)

    // Repeat for verse
    if (!(interaction.options.getInteger('verse') == null)) {
      verse = interaction.options.getInteger('verse');
      if (verse > parseInt(chapter_obj.verses)) {
        verse = Math.ceil(Math.random() * parseInt(chapter_obj.verses));
      }
    } else {
      verse = Math.ceil(Math.random() * parseInt(chapter_obj.verses));
    }

    console.log(
      "book", book,
      "chapter", chapter,
      "verse", verse,
      `https://bible-api.com/${book}%20${chapter}:${verse}?translation=${version}`
    )

    axios({
      method: 'get',
      url: `https://bible-api.com/${book}%20${chapter}:${verse}?translation=${version}`
    })
      .then(response => {
        console.log(response.data)
        let reply = `**${response.data.reference}**\n`;
        reply += `${response.data.text}`;
        interaction.editReply(reply)
      })
      .catch(error => {
        console.log("Error is:\n", error)
        interaction.editReply("Religious people messed it up!")
      });
	}
}

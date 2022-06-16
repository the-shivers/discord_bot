"use strict";

// TO DO: fix genderless thing

const { SlashCommandBuilder } = require('@discordjs/builders');
const { getCaptureDifficulty, getShinyAttachment } = require('../assets/pokemon/poke_funcs.js');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu
} = require('discord.js');
const assets_dir = './assets/pokemon/';
const { async_query } = require('../db/scripts/db_funcs.js')
const f = require('../funcs.js');


async function generate_embed(interaction, game_str, user) {
  let filename = game_str + '.png';
  let img_src = assets_dir + filename;
  let image = new MessageAttachment(img_src, filename);
  const embed = new MessageEmbed()
    .setTitle(`Welcome to the Games Corner!`)
    .setColor('#35654D')
    .setDescription(`You've chosen to play ${game_str}! Set your wager to continue. You have \`₽${user.cash}\` to gamble with.`)
    .setThumbnail('attachment://' + game_str + '.png');
  const row = new MessageActionRow();
  const row2 = new MessageActionRow();
  const wager = new MessageSelectMenu()
    .setCustomId(`games_wager,${interaction.id}`)
    .setPlaceholder('Set Wager')
    .addOptions([
      {label: '₽100', description: 'Wager ₽100', value: '100'},
      {label: '₽200', description: 'Wager ₽200', value: '200'},
      {label: '₽300',	description: 'Wager ₽300', value: '300'},
      {label: '₽500',	description: 'Wager ₽500', value: '500'},
      {label: '₽1000', description: 'Wager ₽1000', value: '1000'},
      {label: '₽5000', description: 'Wager ₽5000', value: '5000'}
    ])
  const decline = new MessageButton()
    .setCustomId(`games_decline,${interaction.id}`)
    .setLabel("I'm afraid...")
    .setStyle('DANGER');
  row.addComponents(wager);
  row2.addComponents(decline);
  return {embeds: [embed], files: [image], components: [row, row2], ephemeral: false, fetchReply: true}
}


async function blackjack(interaction, user) {
  let reply_content = await generate_embed(interaction, 'blackjack', user)
  interaction.reply(reply_content)
  let filter = button => button.customId.includes(interaction.id);
  let collector = interaction.channel.createMessageComponentCollector({ filter, time: 300 * 1000 });
  let responded = false;

  collector.on('collect', i => {
    if (i.user.id === interaction.user.id) {
      responded = true;
      if (i.customId.split(',')[0] == 'games_decline') {
        interaction.editReply({ components: [] })
        i.reply("You chickened out!")
      } else {
        interaction.editReply({ components: [] })
        i.reply(`You wagered: ${parseInt(i.values[0])}`)
      }
    } else {
      i.reply({content: `That's not your game to play!`, ephemeral: true})
    }
  })

  collector.on('end', collected => {
    if (!responded) {
      interaction.editReply({ components: [] })
      interaction.channel.send("You took too long and the Games Corner kicked you out!")
    }
  })
}

async function roulette(interaction, user) {
  let reply_content = await generate_embed(interaction, 'roulette', user)
  interaction.reply(reply_content)
}

module.exports = {
	type: "private",
  cat: "games",
  desc: "Gamble at the Games Corner!",
	data: new SlashCommandBuilder()
		.setName('pgames')
		.setDescription('Gamble at the Games Corner!')
    .addStringOption(option => option
      .setName('game')
      .setDescription('Which Games Corner game to play?')
      .addChoices({name:'Roulette', value:'roulette'}).addChoices({name:'Blackjack', value:'blackjack'})
    ),
	async execute(interaction) {
    interaction.reply("WIP")
    // let game = interaction.options.getString('game');
    // let user = await async_query("SELECT * FROM data.pokemon_trainers WHERE userId = ?;", [interaction.user.id])
    // if (game == 'blackjack') {
    //   blackjack(interaction, user)
    // } else if (game == 'roulette') {
    //   roulette(interaction, user)
    // }
	}
};

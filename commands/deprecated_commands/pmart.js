"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const assets_dir = './assets/pokemon/';
const { activate_user, deactivate_user } = require('../assets/pokemon/poke_funcs.js');


function generate_embed(interaction, cash, slots) {
  // Get image
  let filename = 'mart.png';
  let img_src = assets_dir + filename;
  let image = new MessageAttachment(img_src, filename);

  // Get Description
  let description = `Omega Ball - \`₽2500\` - Roll 7 dice, massively increasing capture chance.
  Ultra Ball - \`₽1000\` - Roll 4 dice, greatly increasing capture chance.
  Great Ball - \`₽750\` - Roll 3 dice, increasing capture chance.
  Poke Ball - \`₽400\` - Roll 2 dice, for a standard capture chance.
  New Pokemon Slot - \`₽5000\` - Hold an additional Pokemon (Max: 24 slots)
  Poke Radar - \`₽3000\` - Choose one encounter's gen. and rarity (slightly harder to catch)
  Hormones - \`₽2000\` - Change a Pokemon's gender with /phormones.`;

  // Embed assembly
  const embed = new MessageEmbed()
    .setTitle(`Welcome to the PokeMart!`)
    .setColor('#5598d5')
    .addField('Your Funds', `₽${cash}`,true)
    .setDescription(description)
    .setThumbnail('attachment://' + filename);
  const buttons1 = new MessageActionRow();
  const buttons2 = new MessageActionRow();
  const slot = new MessageButton()
    .setCustomId(`p_buy_slot,${interaction.id}`)
    .setLabel(`Slot`)
    .setStyle('PRIMARY');
  if (cash <= 5000 || slots >= 24) {slot.setDisabled(true)}
  const radar = new MessageButton()
    .setCustomId(`p_buy_radar,${interaction.id}`)
    .setLabel(`Radar`)
    .setStyle('PRIMARY');
  if (cash <= 3000) {radar.setDisabled(true)}
  const omega = new MessageButton()
    .setCustomId(`p_buy_omega,${interaction.id}`)
    .setLabel(`Omega Ball`)
    .setStyle('PRIMARY');
  if (cash <= 2500) {omega.setDisabled(true)}
  const ultra = new MessageButton()
    .setCustomId(`p_buy_ultra,${interaction.id}`)
    .setLabel(`Ultra Ball`)
    .setStyle('PRIMARY');
  if (cash <= 1000) {ultra.setDisabled(true)}
  const great = new MessageButton()
    .setCustomId(`p_buy_great,${interaction.id}`)
    .setLabel(`Great Ball`)
    .setStyle('PRIMARY');
  if (cash <= 750) {great.setDisabled(true)}
  const poke = new MessageButton()
    .setCustomId(`p_buy_poke,${interaction.id}`)
    .setLabel(`Poke Ball`)
    .setStyle('PRIMARY');
  if (cash <= 400) {poke.setDisabled(true)}
  const hormones = new MessageButton()
    .setCustomId(`p_buy_hormones,${interaction.id}`)
    .setLabel(`Hormones`)
    .setStyle('PRIMARY');
  if (cash <= 2000) {hormones.setDisabled(true)}
  const decline = new MessageButton()
    .setCustomId(`p_buy_decline,${interaction.id}`)
    .setLabel("Too expensive!")
    .setStyle('DANGER');
  buttons1.addComponents(omega, ultra, great, poke);
  buttons2.addComponents(slot, radar, hormones, decline);

  return {
    embeds: [embed],
    files: [image],
    components: [buttons1, buttons2],
    ephemeral: false,
    fetchReply: true
  }

}

module.exports = {
	type: "private",
  cat: "games",
  desc: "Shop at the PokeMart!",
	data: new SlashCommandBuilder()
		.setName('pmart')
		.setDescription('Shop at the PokeMart!'),
	async execute(interaction) {
    if (!activate_user(interaction.user.id, 'lol')) {
      interaction.reply("You're already doing a command.")
      return;
    }
    await interaction.deferReply();

    // Get their info.
    let userId = interaction.user.id;
    let trainer_query = 'SELECT * FROM data.pokemon_trainers WHERE userId = ?;';
    let trainer_result = await async_query(trainer_query, [userId]);
    let cash = (trainer_result.length > 0) ? trainer_result[0].cash : 0;
    let slots = (trainer_result.length > 0) ? trainer_result[0].slots : 6;

    let embed = generate_embed(interaction, cash, slots);
    interaction.editReply(embed);

    let filter = button => button.customId.includes(interaction.id);
    let collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 300 * 1000 });
    let item, price;
    let responded = false;
    let new_row1 = new MessageActionRow();
    let new_row2 = new MessageActionRow();
    let row1 = embed.components[0].components;
    let row2 = embed.components[1].components;
    for (let i = 0; i < row1.length; i++) {
      row1[i].setDisabled(true);
      new_row1.addComponents(row1[i]);
    }
    for (let i = 0; i < row2.length; i++) {
      row2[i].setDisabled(true);
      new_row2.addComponents(row2[i]);
    }

    collector.on('collect', i => {
      console.log('Collected a thing!')
      if (i.user.id === interaction.user.id) {
        if (i.customId.split(',')[0] == 'p_buy_decline') {
          i.reply('You ran away from the PokeMart!')
          interaction.editReply({ components: [new_row1, new_row2] })
          responded = true;
          deactivate_user(interaction.user.id)
          return;
        } else if (i.customId.split(',')[0] == 'p_buy_slot') {
          cash -= 5000;
          slots += 1;
          item = " slot";
          price = 5000;
          let update_q = 'UPDATE data.pokemon_trainers SET slots = ?, cash = ? WHERE userId = ?;';
          async_query(update_q, [slots, cash, userId])
          interaction.editReply(generate_embed(interaction, cash, slots));
        } else if (i.customId.split(',')[0] == 'p_buy_radar') {
          cash -= 3000;
          item = " Poke Radar";
          price = 3000;
          let update_q = 'UPDATE data.pokemon_trainers SET cash = ?, rareChances = rareChances + 1 WHERE userId = ?;';
          async_query(update_q, [cash, userId])
          interaction.editReply(generate_embed(interaction, cash, slots));
        } else if (i.customId.split(',')[0] == 'p_buy_omega') {
          cash -= 2500;
          item = "n Omega Ball";
          price = 2500;
          let update_q = 'UPDATE data.pokemon_trainers SET cash = ?, omegaballs = omegaballs + 1 WHERE userId = ?;';
          async_query(update_q, [cash, userId])
          interaction.editReply(generate_embed(interaction, cash, slots));
        } else if (i.customId.split(',')[0] == 'p_buy_ultra') {
          cash -= 1000;
          item = "n Ultra Ball";
          price = 1000;
          let update_q = 'UPDATE data.pokemon_trainers SET cash = ?, ultraballs = ultraballs + 1 WHERE userId = ?;';
          async_query(update_q, [cash, userId])
          interaction.editReply(generate_embed(interaction, cash, slots));
        } else if (i.customId.split(',')[0] == 'p_buy_great') {
          cash -= 750;
          item = " Great Ball";
          price = 750;
          let update_q = 'UPDATE data.pokemon_trainers SET cash = ?, greatballs = greatballs + 1 WHERE userId = ?;';
          async_query(update_q, [cash, userId])
          interaction.editReply(generate_embed(interaction, cash, slots));
        } else if (i.customId.split(',')[0] == 'p_buy_poke') {
          cash -= 400;
          item = " Poke Ball";
          price = 400;
          let update_q = 'UPDATE data.pokemon_trainers SET cash = ?, pokeballs = pokeballs + 1 WHERE userId = ?;';
          async_query(update_q, [cash, userId])
          interaction.editReply(generate_embed(interaction, cash, slots));
        } else if (i.customId.split(',')[0] == 'p_buy_hormones') {
          cash -= 2000;
          item = " hormones";
          price = 2000;
          let update_q = 'UPDATE data.pokemon_trainers SET cash = ?, hormones = hormones + 1 WHERE userId = ?;';
          async_query(update_q, [cash, userId])
          interaction.editReply(generate_embed(interaction, cash, slots));
        }
        i.reply(`You bought a${item} for \`₽${price}\`! Nice!`)
      } else {
        i.reply({ content: "One customer at a time! Get out!!!", ephemeral: false });
      }
    });

    collector.on('end', collected => {
      if (!responded) {
        interaction.editReply({ components: [new_row1, new_row2] })
        interaction.channel.send("The shop closed!")
        deactivate_user(interaction.user.id)
      }
    });

	}
};

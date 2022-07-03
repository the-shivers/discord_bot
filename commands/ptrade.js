"use strict";

// TO DO: fix genderless thing

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');
const Canvas = require('canvas');
const { async_query } = require('../db/scripts/db_funcs.js')
const { activate_user, deactivate_user } = require('../assets/pokemon/poke_funcs.js');


module.exports = {
	type: "private",
  cat: "games",
  desc: "Trade pokemon!",
	data: new SlashCommandBuilder()
		.setName('ptrade')
		.setDescription('Trade pokemon!')
    .addIntegerOption(option => option
      .setName('your_slot')
      .setDescription('Which of your pokemon to offer.')
      .addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
			.addChoices({name:'7', value:7}).addChoices({name:'8', value:8})
			.addChoices({name:'9', value:9}).addChoices({name:'10', value:10})
			.addChoices({name:'11', value:11}).addChoices({name:'12', value:12})
      .addChoices({name:'13', value:13}).addChoices({name:'14', value:14})
			.addChoices({name:'15', value:15}).addChoices({name:'16', value:16})
			.addChoices({name:'17', value:17}).addChoices({name:'18', value:18})
      .setRequired(true)
    ).addUserOption(option => option
      .setName('target')
      .setDescription('Who to trade with.')
      .setRequired(true)
    ).addIntegerOption(option => option
      .setName('their_slot')
      .setDescription('Which of their pokemon to ask for.')
      .addChoices({name:'1', value:1}).addChoices({name:'2', value:2})
      .addChoices({name:'3', value:3}).addChoices({name:'4', value:4})
      .addChoices({name:'5', value:5}).addChoices({name:'6', value:6})
			.addChoices({name:'7', value:7}).addChoices({name:'8', value:8})
			.addChoices({name:'9', value:9}).addChoices({name:'10', value:10})
			.addChoices({name:'11', value:11}).addChoices({name:'12', value:12})
      .addChoices({name:'13', value:13}).addChoices({name:'14', value:14})
			.addChoices({name:'15', value:15}).addChoices({name:'16', value:16})
			.addChoices({name:'17', value:17}).addChoices({name:'18', value:18})
      .setRequired(true)
    ),
	async execute(interaction) {
    if (!activate_user(interaction.user.id, 'lol')) {
      interaction.reply("You're already doing a command.")
      return;
    }
    await interaction.deferReply();
    let user = interaction.user;
    let target = interaction.options.getUser('target');
    let user_slot = interaction.options.getInteger('your_slot');
    let target_slot = interaction.options.getInteger('their_slot');
    let query = "SELECT * FROM data.pokemon_encounters WHERE userId = ? AND owned = 1 ORDER BY slot ASC;";
    let user_team = await async_query(query, [user.id]);
    let target_team = await async_query(query, [target.id]);

    if (user_team.length === 0) {
      interaction.editReply("You don't have any Pokemon! Try catching one with `/pcatch`!");
      deactivate_user(interaction.user.id)
      return;
    } else if (target_team.length === 0) {
      interaction.editReply("They don't have any Pokemon! They can catch some with `/pcatch`!")
      deactivate_user(interaction.user.id)
      return;
    } else if (user_slot > user_team.length) {
      interaction.editReply("You don't have a Pokemon in that slot! You can check with `/pteam`!")
      deactivate_user(interaction.user.id)
      return;
    } else if (target_slot > target_team.length) {
      interaction.editReply("They don't have a Pokemon in that slot! You can check with `/pteam`!")
      deactivate_user(interaction.user.id)
      return;
    } else if (target.id === user.id) {
      interaction.editReply("You can't trade with yourself!")
      deactivate_user(interaction.user.id)
      return;
    }

    let desc = `<@&${target.id}> has a trade offer!\n\n${user.username} wants to `;
    desc += `trade their ${user_team[user_slot-1].name} for your ${target_team[target_slot-1].name}.`;

    const embed = new MessageEmbed()
      .setTitle(`Trade offer for ${target.username}!`)
      .setColor("BLURPLE")
      .setDescription(desc);
    const buttons = new MessageActionRow();
    const accept = new MessageButton()
      .setCustomId(`accept,${interaction.id}`)
      .setLabel(`Accept Trade`)
      .setStyle('SUCCESS');
    const decline = new MessageButton()
      .setCustomId(`decline,${interaction.id}`)
      .setLabel("Decline Trade")
      .setStyle('DANGER');
    buttons.addComponents(accept, decline);

    interaction.editReply({
        embeds: [embed],
        // files: [image],
        components: [buttons],
        ephemeral: false,
        fetchReply: true
    });

    let filter = button => button.customId.includes(interaction.id);
    let collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 180 * 1000 });

    let responded = false;
    let content;
    let new_row = new MessageActionRow();
    let row = buttons.components;
    for (let i = 0; i < row.length; i++) {
      row[i].setDisabled(true);
      new_row.addComponents(row[i]);
    }

    collector.on('collect', i => {
      if (i.user.id === target.id) {
        if (i.customId.split(',')[0] == 'decline') {
          content = 'The trade was declined!'
        } else if (i.customId.split(',')[0] == 'accept') {
          content = 'The trade was accepted! Team slots have updated, check with `/pteam`!';
          // Update logic will go here.
          let update_q = "UPDATE data.pokemon_encounters SET userId = ?, slot = ? WHERE id = ?;";
          let vals1 = [user.id, user_team[user_slot-1].slot, target_team[target_slot-1].id];
          let vals2 = [target.id, target_team[target_slot-1].slot, user_team[user_slot-1].id];
          async_query(update_q, vals1);
          async_query(update_q, vals2);
        }
        responded = true;
        i.reply({ content: content, ephemeral: false });
        interaction.editReply({ components: [new_row] })
        deactivate_user(interaction.user.id)
      } else {
        i.reply({ content: "That trade offer isn't for you!", ephemeral: false });
      }
    });

    collector.on('end', collected => {
      if (!responded) {
        interaction.editReply({ components: [new_row] })
        interaction.channel.send(`The trade was declined because ${target.username} took too long.`)
        deactivate_user(interaction.user.id)
      }
    });

	}
};

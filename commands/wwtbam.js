"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')


const assets_dir = './assets/wwtbam/';
const regis_name = 'regis.png';
const regis = new MessageAttachment(assets_dir + regis_name, regis_name);
const logo_name = 'wwtbam_logo.gif';
const logo = new MessageAttachment(assets_dir + logo_name, logo_name);

let phone_text = 'Call a friend for advice. Good on all questions, but not all';
phone_text += ' your friends are very reliable.';
let audience_text = 'Poll the audience. More reliable on easy questions.';
let fifty_fifty_text = 'Eliminate half the answers. Simple.';
let description = `Welcome to Who Wants to Be a Millionaire! I'm your host, `;
description += `Regis Philbin. To win one million dollars, you'll have to `;
description += `answer 15 questions correctly in a row, winning more as the `;
description += `questions grow more difficult. If you get one wrong, you'll `;
description += `lose everything after the last milestone you hit. You can `;
description += `leave at any time to keep what you\'ve won, and you also have `;
description += `three lifelines to help you (described below). Are you ready?`;

function generate_reply_data(interaction, status) {
	const embed = new MessageEmbed()
		.setTitle(`${interaction.user.username} wants to be a millionaire!`)
		.setColor("#6622AA")
		.addField('50/50', fifty_fifty_text, true)
		.addField("Phone a friend", phone_text, true)
		.addField("Ask the audience", audience_text, true)
		.setDescription(description)
		.setThumbnail('attachment://' + logo_name)
		.setImage('attachment://' + regis_name);
	const buttons = new MessageActionRow()
	const decline = new MessageButton()
		.setCustomId('wwtbam_decline')
		.setLabel('No thanks!')
		.setStyle('DANGER');
	if (status.length === 0 || status[0].status === 0 || (interaction.createdAt - status[0].updatedAt) / 1000 > 300) {
    console.log("Time since channels last game", interaction.createdAt - status[0].updatedAt)
		var accept = new MessageButton()
			.setCustomId('wwtbam_start')
			.setLabel('Let\'s go!')
			.setStyle('SUCCESS');
	} else if (status[0].status === 1) {
		var accept = new MessageButton()
			.setCustomId('wwtbam_start')
			.setLabel('Game already in progress')
			.setStyle('SUCCESS')
			.setDisabled(true);
	}
	buttons.addComponents(accept, decline);
	return {
		embeds: [embed],
		files: [regis, logo],
		components: [buttons],
		ephemeral: false,
		fetchReply: true
	}
}


function submit_reply(interaction, status) {
	let filter = click => {return click.user.id === interaction.user.id};
	let wait = 45000;
	interaction.reply(
		generate_reply_data(interaction, status)
	).then(embedMessage => {
		embedMessage.channel.awaitMessageComponent({
			filter, max: 1, time: wait, errors: ['time']
		}).then(collected => {
			embedMessage.delete();
		}).catch(() => {
			embedMessage.delete();
			interaction.channel.send(
				'No reply after ' + (wait / 1000) + ' seconds, operation canceled.'
			).then(m => {
				setTimeout(() => m.delete(), wait / 3)
			});
		});
	})
}


module.exports = {
	type: "public",
  cat: "games",
  desc: "Explains the single-player trivia game, Who Wants to Be a Millionaire",
	data: new SlashCommandBuilder()
		.setName('wwtbam')
		.setDescription('Play Who Wants to Be a Millionaire'),
	async execute(interaction) {
    const query = "SELECT * FROM data.wwtbam_status WHERE channelId = ?";
    const values = [interaction.channelId];
    let status = await async_query(query, values);
    submit_reply(interaction, status)
	}
};

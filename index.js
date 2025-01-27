"use strict";

require('dotenv').config();

// Imports
const {Client, Collection, Intents} = require('discord.js');
const fs = require('fs');
const dp = require('./data_processing.js');
const auth = require("./config.json");
const { async_query } = require('./db/scripts/db_funcs.js')
const client = new Client({intents:
	[
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS
	]
});

// Define data arrays to collect within
let interactions_data = [];
let interaction_opt_data = [];
let message_data = [];

// Collect commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (Array.isArray(command)) {
		for (let i = 0; i < command.length; i++) {
			client.commands.set(command[i].data.name, command[i]);
		}
	} else {
		client.commands.set(command.data.name, command);
	}
}

// Collect buttons
client.buttons = new Collection();
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
for (const file of buttonFiles) {
	const button = require(`./buttons/${file}`);
	client.buttons.set(file.split('.')[0], button);
}

// Collect events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Define interval functions
function insert_and_clear() {
	dp.upload_data(interactions_data, interaction_opt_data, message_data);
	interactions_data = [];
	interaction_opt_data = [];
	message_data = [];
}

async function remind() {
	let query = 'SELECT * FROM data.reminders WHERE responded = 0 AND epoch <= ?;';
	let values = [Math.floor(new Date().getTime() / 1000)]; // Epoch Seconds
	let result = await async_query(query, values);
	for (let i = 0; i < result.length; i++) {
		let channel = client.channels.cache.get(result[i].channelId);
		channel.send('<@' + result[i].userId + '> ' + ' ' + result[i].message);
		await new Promise(resolve => setTimeout(resolve, 5000));
		let update_query = "UPDATE data.reminders SET responded = 1 WHERE id = ?;";
		let update_values = [result[i].id]
		async_query(update_query, update_values);
	}
}

// Login and Ready, set intervals
client.login(auth.token);
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
	setInterval(insert_and_clear, 60000);
	setInterval(remind, 20000);
});

// Receive commands
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		var command = client.commands.get(interaction.commandName);
		if (!command) return;
		interactions_data.push(dp.process_interaction(interaction));
    let processed_options = dp.process_interaction_options(interaction);
		interaction_opt_data = interaction_opt_data.concat(processed_options);
	} else if (interaction.isContextMenu()) {
		var command = client.commands.get(interaction.commandName);
		if (!command) return;
		interactions_data.push(dp.process_interaction(interaction));
	} else if (interaction.isButton()) {
		var command = client.buttons.get(interaction.customId);
		if (!command) return;
	} else { return; }
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true
    });
	}
});


client.on('messageCreate', async msg => {
	message_data.push(dp.process_message(msg));
});


module.exports.buttonHandler = (client) => {
	client.on('interactionCreate', async interaction => {
	  if (interaction.isButton()) {
		const [action, conversationId] = interaction.customId.split(':');
		if (!['llm_continue', 'llm_input'].includes(action)) return;
  
		const cached = conversationCache.get(conversationId);
		if (!cached) {
		  await interaction.reply({ content: 'Conversation expired.', ephemeral: true });
		  return;
		}
  
		if (interaction.user.id !== interaction.message.interaction.user.id) {
		  await interaction.reply({ content: 'Only the original user can continue this conversation.', ephemeral: true });
		  return;
		}
  
		await interaction.deferUpdate();
  
		let { history, systemPrompt, maxTokens, title, part } = cached;
		
		if (action === 'llm_continue') {
		  history.push({ role: "user", content: "Please continue from where you left off." });
		} else if (action === 'llm_input') {
		  const modal = new Modal()
			.setCustomId(`llm_modal:${conversationId}`)
			.setTitle('Additional Input');
  
		  const input = new TextInputComponent()
			.setCustomId('input')
			.setLabel('Your input')
			.setStyle('PARAGRAPH');
  
		  modal.addComponents(new MessageActionRow().addComponents(input));
		  await interaction.showModal(modal);
  
		  try {
			const submitted = await interaction.awaitModalSubmit({
			  filter: i => i.customId === `llm_modal:${conversationId}` && i.user.id === interaction.user.id,
			  time: 300000
			});
  
			const inputText = submitted.fields.getTextInputValue('input');
			history.push({ role: "user", content: inputText });
			await submitted.deferUpdate();
		  } catch (error) {
			console.error('Modal error:', error);
			return;
		  }
		}
  
		try {
		  const response = await callLLM(history, maxTokens);
		  history.push({ role: "assistant", content: response });
  
		  const context = `Previous context: ${history[history.length - 2].content.slice(-100)}...`;
		  const newEmbed = new MessageEmbed()
			.setTitle(title)
			.setColor("#0099ff")
			.setDescription(`**Context:**\n${context}\n\n**Response:**\n${response}`)
			.setFooter({ text: `Part ${part}` });
  
		  const newButtons = new MessageActionRow().addComponents(
			new MessageButton()
			  .setCustomId(`llm_continue:${conversationId}`)
			  .setLabel('Continue')
			  .setStyle('PRIMARY'),
			new MessageButton()
			  .setCustomId(`llm_input:${conversationId}`)
			  .setLabel('Continue with Input')
			  .setStyle('SUCCESS')
		  );
  
		  await interaction.message.edit({ embeds: [newEmbed], components: [newButtons] });
  
		  conversationCache.set(conversationId, {
			history,
			systemPrompt,
			maxTokens,
			title,
			part: part + 1
		  });
  
		} catch (error) {
		  console.error('API Error:', error);
		  await interaction.followUp({ content: 'Error generating response.', ephemeral: true });
		}
	  }
	});
  };
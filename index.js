"use strict";

// Imports
const {Client, Collection, Intents} = require('discord.js');
const fs = require('fs');
const dp = require('./data_processing.js');
const auth = require("./config.json");
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


function insert_and_clear() {
	dp.upload_data(interactions_data, interaction_opt_data, message_data);
	interactions_data = [];
	interaction_opt_data = [];
	message_data = [];
}


// Login and Ready
client.login(auth.token);
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
	setInterval(insert_and_clear, 60000);
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

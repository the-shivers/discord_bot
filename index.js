"use strict";

// Imports
const {Client, Collection, Intents} = require('discord.js');
const fs = require('fs');
const dp = require('./data_processing.js');
const auth = require("./config.json");
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ]})

// Define data arrays to collect within
let interactions_data = [];
let interaction_opt_data = [];
let message_data = [];

// Collect commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
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
	console.log(
		'interactions data: ', interactions_data,
		'interactions_opt_data:', interaction_opt_data,
		'message_data:', message_data);
	upload_data(interactions_data, interaction_opt_data, message_data);
	interactions_data = [];
	interaction_opt_data = [];
	message_data = [];
}


// Login and Ready
client.login(auth.token);
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
	setInterval(insert_and_clear, 12000);
});

// Receive commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
		interactions_data.push(dp.process_interaction(interaction));
		interaction_opt_data.push(dp.process_interaction_options(interaction));
	} catch (error) {
		console.error(error);
		await interaction.reply({content: 'There was an error while \
      executing this command!', ephemeral: true});
	}
});

client.on('messageCreate', async msg => {
	message_data.push(dp.process_message(msg));
});

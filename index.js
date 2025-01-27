"use strict";

require('dotenv').config();

// Imports
const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
const dp = require('./data_processing.js');
const auth = require("./config.json");
const { async_query } = require('./db/scripts/db_funcs.js');

const client = new Client({
  intents: [
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

// Collect events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
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
    let update_values = [result[i].id];
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

// Interaction handling
client.on('interactionCreate', async interaction => {
  if (interaction.isCommand() || interaction.isContextMenu()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      interactions_data.push(dp.process_interaction(interaction));
      if (interaction.isCommand()) {
        const processed_options = dp.process_interaction_options(interaction);
        interaction_opt_data = interaction_opt_data.concat(processed_options);
      }
      
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      });
    }
  }
});

// Message handling
client.on('messageCreate', async msg => {
  message_data.push(dp.process_message(msg));
});
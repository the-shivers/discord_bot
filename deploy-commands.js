const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token, guildIds } = require('./config.json');
const fs = require('fs');

const commands = {'public': [], 'private': []}
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (Array.isArray(command)) {
		for (let i = 0; i < command.length; i++) {
			commands[command[i].type].push(command[i].data.toJSON());
		}
	} else {
		commands[command.type].push(command.data.toJSON());
	}
}

console.log('Comands are:\n', commands)

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(
			Routes.applicationCommands(clientId),
			{body: commands.public},
		);
		for (let i = 0; i < guildIds.length; i++) {
			await rest.put(
				Routes.applicationGuildCommands(clientId, guildIds[i].id),
				{body: commands.private},
			);
		};
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

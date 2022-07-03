"use strict";

// Constants
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const assets_dir = './assets/pokemon/images/';
const config = require('../assets/pokemon/poke_info.json')
const { getStats, getPokePic, activate_user, deactivate_user } = require('../assets/pokemon/poke_funcs.js');
const { getValue } = require('../assets/pokemon/poke_funcs.js');
const fs = require('fs');
let filenames = fs.readdirSync(assets_dir)


module.exports = {
	type: "private",
  cat: "games",
  desc: "Release a pokemon, earning some money.",
	data: new SlashCommandBuilder()
		.setName('prelease')
		.setDescription('Release a pokemon, earning some money.')
    .addIntegerOption(option => option
      .setName('slot')
      .setDescription('The slot of the pokemon to release.')
			// Why yes, I do code professionally, however SlashCommandBuilder you tell?
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
    let slot = interaction.options.getInteger('slot')
    let query = 'SELECT p.*, pd.frequency, pd.type1, pd.baseFreq, pd.evStage FROM data.pokemon_encounters AS p LEFT JOIN data.pokedex AS pd ON p.pokemonId = pd.pokemonId WHERE userId = ? AND owned = 1 ORDER BY slot ASC;';
    let values = [interaction.user.id];
    let status = await async_query(query, values);
    if (slot > status.length) {
      interaction.editReply("You don't have a pokemon in that slot!")
			deactivate_user(interaction.user.id)
			return;
    }
		let pokemon = status[slot - 1];
		let money = getValue(pokemon);
		let gender = ''
    if (pokemon.gender == 'male') {
      gender = '\♂'
    } else if (pokemon.gender == 'female') {
      gender = '\♀'
    }
		let title = `Are you sure you want to release ${pokemon.nick}?`
		let field1 = `\`${pokemon.name} ${gender}\``;
		let field2 = `\`${pokemon.level}\``;
		let field3 = `\`${pokemon.pokemonChar1}\`, \`${pokemon.pokemonChar2}\``;
		let desc = `You will gain ₽${money} if you choose to release this Pokemon.`;
		let filename_arr = filenames.filter(filename => filename.startsWith(pokemon.pokemonId.toString().padStart(3, '0')));
    filename_arr.unshift(filename_arr.pop());
    let filename = filename_arr[pokemon.formIndex];
    let full_path = assets_dir + filename;
    let poke_pic = await getPokePic(full_path, filename, pokemon.shinyShift);
		const buttons = new MessageActionRow();
		const release = new MessageButton()
			.setCustomId(`release,${interaction.id}`)
			.setLabel(`Release`)
			.setStyle('SUCCESS');
		const keep = new MessageButton()
			.setCustomId(`keep,${interaction.id}`)
			.setLabel(`No, I wanna keep the Pokemon!`)
			.setStyle('DANGER');
		buttons.addComponents(release, keep);
		const embed = new MessageEmbed()
      .setTitle(title)
      .setColor(config.types[pokemon.type1].color)
      .setDescription(desc)
      .setImage('attachment://poke_pic.png')
      .addFields(
        { name: 'Pokemon', value: field1, inline: true },
        { name: 'Level', value: field2, inline: true },
        { name: 'Traits', value: field3, inline: true },
    	);
    interaction.editReply({ embeds: [embed], files: [poke_pic], components: [buttons] })

		let responded = false;
		let filter = button => button.customId.includes(interaction.id);
		let collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 300 * 1000 });
		let new_row = new MessageActionRow();
		for (let i = 0; i < buttons.components.length; i++) {
			buttons.components[i].setDisabled(true);
			new_row.addComponents(buttons.components[i]);
		}

		collector.on('collect', i => {
			if (i.user.id === interaction.user.id) {
				responded = true;
				interaction.editReply({ components: [new_row] })
				if (i.customId.split(',')[0] == 'keep') {
					i.reply('You kept your pokemon!')
					deactivate_user(interaction.user.id)
				} else if (i.customId.split(',')[0] == 'release') {
					i.reply(`Goodbye ${pokemon.name}! Other slots have updated. You got ₽${money} for releasing them.`);
					let release_query = 'UPDATE data.pokemon_encounters SET owned = 0 WHERE id = ?;';
		      let release_values = [pokemon.id];
					let money_query = 'UPDATE data.pokemon_trainers SET cash = cash + ? WHERE userId = ?;'
					async_query(release_query, release_values);
					async_query(money_query, [money, interaction.user.id]);
					deactivate_user(interaction.user.id)
				}
			} else {
				i.reply({ content: "That's not your pokemon to release or keep!", ephemeral: false });
			}
		})

		collector.on('end', collected => {
			if (!responded) {
				interaction.editReply({ components: [new_row] })
				interaction.channel.send("Took too long to decide!");
				deactivate_user(interaction.user.id)
			}
		})

	}
}

"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const { activate_user, deactivate_user, release_values } = require('../assets/pokemon/poke_funcs.js');
const config = require('../assets/pokemon/poke_info.json')
const f = require('../funcs.js');
const assets_dir = './assets/pokemon/thumbnails/';

module.exports = {
	type: "private",
  cat: "games",
  desc: "Breed two pokemon to create an egg!",
	data: new SlashCommandBuilder()
		.setName('pbreed')
		.setDescription("Breed two pokemon to create an egg!")
    .addIntegerOption(option => option
      .setName('slot1')
      .setDescription('The slot of the first pokemon to be swapped.')
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
    ).addIntegerOption(option => option
      .setName('slot2')
      .setDescription('The slot of the second pokemon to be swapped.')
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
    let slot1 = interaction.options.getInteger('slot1');
    let slot2 = interaction.options.getInteger('slot2');
    let query1 = "SELECT pe.*, p.egg1, p.egg2, p.baseId, p.baseName, p.baseFreq, p.pctMale FROM data.pokemon_encounters AS pe JOIN data.pokedex AS p ON pe.pokemonId = p.pokemonId WHERE userId = ? AND owned = 1 ORDER BY slot ASC;";
    let query2 = "SELECT * FROM data.pokemon_trainers WHERE userId = ?;";
    let team = await async_query(query1, [interaction.user.id]);
    let data = await async_query(query2, [interaction.user.id]);
    if (slot1 > team.length || slot2 > team.length) {
      interaction.editReply("You don't have a pokemon in that slot!")
			deactivate_user(interaction.user.id)
      return
    } else if (slot1 == slot2) {
      interaction.editReply("That doesn't make any sense!")
			deactivate_user(interaction.user.id)
      return
    } else if (team.length >= data[0].slots) {
      interaction.editReply("You don't have room!")
      deactivate_user(interaction.user.id)
      return
    }
    let pokemon1 = team[slot1-1];
    let pokemon2 = team[slot2-1];

    pokemon1.isFemale = pokemon1.gender == 'female'
    if (!((pokemon1.gender == 'male' && pokemon2.gender == 'female') || (pokemon1.gender == 'female' && pokemon2.gender == 'male'))) {
      interaction.editReply("You need one female and one male pokemon!")
      deactivate_user(interaction.user.id)
      return
    }
    console.log('terndcond', pokemon1.gender == 'female')
    let female_mon = (pokemon1.gender == 'female') ? pokemon1 : pokemon2;
    console.log(`femmon is `, female_mon)
    let price = release_values[female_mon.baseFreq]
    if (pokemon1.level < 0 || pokemon2.level < 0) {
      interaction.editReply("Eggs can't breed!")
      deactivate_user(interaction.user.id)
      return
    }
    pokemon1.egg1 = (pokemon1.egg1.length > 0 && pokemon1.egg1 != 'Undiscovered') ? pokemon1.egg1 : 'NOTHING1'
    pokemon1.egg2 = (pokemon1.egg2.length > 0 && pokemon1.egg2 != 'Undiscovered') ? pokemon1.egg2 : 'NOTHING2'
    pokemon2.egg1 = (pokemon2.egg1.length > 0 && pokemon2.egg1 != 'Undiscovered') ? pokemon2.egg1 : 'NOTHING3'
    pokemon2.egg2 = (pokemon2.egg2.length > 0 && pokemon2.egg2 != 'Undiscovered') ? pokemon2.egg2 : 'NOTHING4'
    if (
      !((pokemon1.egg1 == pokemon2.egg1) ||
      (pokemon1.egg1 == pokemon2.egg2) ||
      (pokemon1.egg2 == pokemon2.egg1) ||
      (pokemon1.egg2 == pokemon2.egg2))
    ) {
      interaction.editReply("Pokemon must have at least one egg group in common!")
      deactivate_user(interaction.user.id)
      return
    }

    // All checks pass. Generate embed.
    let filename = 'egg_thumbnail.png';
    let img_src = assets_dir + filename;
    let image = new MessageAttachment(img_src, filename);
    const embed = new MessageEmbed()
      .setTitle(`${pokemon1.nick} and ${pokemon2.nick} are feeling frisky!`)
      .setColor("RED")
      .setThumbnail('attachment://' + filename)
      .setDescription(`They want to make an egg that will hatch into a new ${female_mon.baseName}! This egg will take up a slot in your inventory and won't hatch for about ${10-female_mon.baseFreq} days. It will be nearly worthless until then. This will also cost ₽${price}.\n\nAllow the pokemon to breed?`);
    const buttons = new MessageActionRow();
    const accept = new MessageButton()
      .setCustomId(`accept,${interaction.id}`)
      .setLabel(`Accept ₽${price}`)
      .setStyle('SUCCESS');
    if (data[0].cash <= price) {accept.setDisabled(true)}
    const decline = new MessageButton()
      .setCustomId(`decline,${interaction.id}`)
      .setLabel("Decline")
      .setStyle('DANGER');
    buttons.addComponents(accept, decline);

    interaction.editReply({
        embeds: [embed],
        files: [image],
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
      if (i.user.id === interaction.user.id) {
        if (i.customId.split(',')[0] == 'decline') {
          content = 'You refused to let your Pokemon get frisky!'
        } else if (i.customId.split(',')[0] == 'accept') {
          let curr_epoch_s = Math.floor(new Date().getTime() / 1000);
          content = `You let your pokemon get frisky and they made an egg! It's kind of slimy. Look at it with \`/pteam\`!`;
          let traits, isShiny, shinyShift, gender;
          traits = f.shuffle(config.characteristics).slice(0, 2);
          let shiny_parents = (pokemon1.isShiny == 1) ? 1 : 0
          shiny_parents += (pokemon2.isShiny == 1) ? 1 : 0
          console.log(shiny_parents)
          let shiny_chance_index = [20, 4, 2]
          isShiny = Math.floor(Math.random() * shiny_chance_index[shiny_parents]) == 0;
          if (isShiny) {
            shinyShift = Math.floor((Math.random() * 66 + 16) * 3.6);
          } else {
            shinyShift = 0;
          }
          if (!(female_mon.pctMale == null)) {
            let rand = Math.random()
            gender = rand <= (female_mon.pctMale / 100) ? 'male' : 'female';
          } else {
            gender = 'unknown'
          }
          let update_query1 = `
          INSERT INTO data.pokemon_encounters (userId, pokemonId, name, nick,
            level, gender, pokemonChar1, pokemonChar2, isShiny, shinyShift, attempted,
            caught, owned, captureDifficulty, slot, epoch, isTraining)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
          `;
          let update_vals1 = [
            interaction.user.id, female_mon.baseId, female_mon.baseName,
            female_mon.baseName + Math.ceil(Math.random() * 1000),
            (10 - female_mon.baseFreq) * (-4), gender, traits[0], traits[1], isShiny,
            shinyShift, '', 0, 1, 0, curr_epoch_s, curr_epoch_s, 0
          ]
          let update_query2 = 'UPDATE data.pokemon_trainers SET cash = cash - ? WHERE userId = ?';
          let update_vals2 = [price, interaction.user.id]
          console.log(update_vals2)
          async_query(update_query1, update_vals1);
          async_query(update_query2, update_vals2);
        }
        responded = true;
        i.reply({ content: content, ephemeral: false });
        interaction.editReply({ components: [new_row] })
        deactivate_user(interaction.user.id);
      } else {
        i.reply({ content: "That breeding offer is for someone else!", ephemeral: true });
      }
    });

    collector.on('end', collected => {
      if (!responded) {
        interaction.editReply({ components: [new_row] })
        interaction.followUp(`${interaction.user.username} took too long to decide and killed the mood.`)
        deactivate_user(interaction.user.id)
      }
    });

  }
}

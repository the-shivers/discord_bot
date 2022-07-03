"use strict";

// Constants
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton
} = require('discord.js');
const { async_query } = require('../db/scripts/db_funcs.js')
const assets_dir = './assets/pokemon/images/';
const config = require('../assets/pokemon/poke_info.json')
const { getStats, getPokePic, activate_user, deactivate_user } = require('../assets/pokemon/poke_funcs.js');
const fs = require('fs');
let filenames = fs.readdirSync(assets_dir)

module.exports = {
  type: "private",
  cat: "games",
  desc: "See one of your pokemon!",
	data: new SlashCommandBuilder()
		.setName('pview')
		.setDescription('Show your Pokemon team!')
    .addIntegerOption(option => option
      .setName('slot')
      .setDescription('The slot of the pokemon to view.')
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
      .setDescription('The slot of the pokemon to view.')
    ),
	async execute(interaction) {
    if (!activate_user(interaction.user.id, 'lol')) {
      interaction.reply("You're already doing a command.")
      return;
    }
    await interaction.deferReply({fetchReply: true});

    // Fetch information about Pokemon.
    let slot = interaction.options.getInteger('slot');
    let user = interaction.options.getUser('target') ?? interaction.user;
    let query1 = `
    SELECT
      ps.*,
      p.type1, p.type2, p.hp, p.attack, p.defense, p.spAttack, p.spDefense, p.speed,
      p.species, p.description, p.height, p.weight, p.egg1, p.egg2, p.frequency,
      p.evLevel, p.evIds
    FROM data.pokemon_encounters AS ps
    LEFT JOIN data.pokedex AS p
    ON ps.pokemonId = p.pokemonId
    WHERE userId = ? AND owned = 1
    ORDER BY slot ASC;`
    let values1 = [user.id]
    let team = await async_query(query1, values1);
    if (team.length === 0) {
      interaction.editReply(`${user.username} doesn't have any Pokemon! Catch some with `/pcatch`!`);
      deactivate_user(interaction.user.id)
      return;
    } else if (slot > team.length) {
      interaction.editReply("No pokemon in that slot!")
      deactivate_user(interaction.user.id)
      return;
    }
    let pokemon = team[slot-1];
    let ev_id_array = pokemon.evIds.split('|');
    let ev_text = '';
    if (ev_id_array[0].length > 0 && pokemon.canEvolve == 1) {
      ev_text = ' Evolves into ';
      let name_arr = []
      let ev_query = `SELECT * FROM data.pokedex WHERE pokemonId IN (?${', ?'.repeat(ev_id_array.length - 1)});`;
      let ev_result = await async_query(ev_query, ev_id_array);
      for (let i = 0; i < ev_result.length; i++) {
        name_arr.push(ev_result[i].name);
      }
      ev_text += name_arr.join(', ').replace(/, ([^,]*)$/, ' or $1')
      ev_text += ` at level ${pokemon.evLevel}.`
    }

    // Get trainer money information
    let trainer_info = await async_query('SELECT * FROM data.pokemon_trainers WHERE userId = ?;', [user.id])
    trainer_info = trainer_info[0]

    // Generate components
    let author = '#' + pokemon.pokemonId.toString().padStart(3, '0');
    author += ' - ' + pokemon.name + ` (${pokemon.species})`
    let gender = ''
    if (pokemon.gender == 'male') {
      gender = '\\♂'
    } else if (pokemon.gender == 'female') {
      gender = '\\♀'
    }
    let title = pokemon.nick + gender + ` - Lvl. ${pokemon.level}`;
    let description = `*Rarity: ${config.rarities[pokemon.frequency.toString()]}.* `
    description += pokemon.description;
    let type2 = (pokemon.type2 != '') ? `, \`${pokemon.type2}\`` : '';
    let field1 = `\`${pokemon.type1}\`` + type2;
    let egg2 = (pokemon.egg2 != '') ? `, \`${pokemon.egg2}\`` : '';
    let field2 = `\`${pokemon.egg1}\`` + egg2;
    let field3 = `\`${pokemon.pokemonChar1}\`, \`${pokemon.pokemonChar2}\``;
    let color = config.types[pokemon.type1].color;
    // let filename = pokemon.pokemonId.toString().padStart(3, '0') + '.png'
    let filename_arr = filenames.filter(filename => filename.startsWith(pokemon.pokemonId.toString().padStart(3, '0')));
    filename_arr.unshift(filename_arr.pop());
    pokemon['forms'] = filename_arr.length;
    let filename = filename_arr[pokemon.formIndex];
    let full_path = assets_dir + filename;
    let poke_pic = await getPokePic(full_path, filename, pokemon.shinyShift);

    // Generate stats block.
    let stats_block = "\n```";
    let stats = getStats(pokemon.epoch, pokemon.level, pokemon);
    for (var key of Object.keys(stats)) {
      stats_block += key.slice(0, 3).padStart(3, ' ') + ' ' + stats[key].val.toString().padStart(3, ' ');
      stats_block += ` ${stats[key].symb} |${'|'.repeat(Math.ceil(stats[key].val / 5))}\n`
    }
    stats_block = stats_block.slice(0,-1).toUpperCase() + '```'

    const buttons = new MessageActionRow();
    const evo_toggle = new MessageButton()
      .setCustomId(`p_view_evo,${interaction.id}`)
      .setLabel(`${(pokemon.canEvolve) == 1 ? 'Disable Evolution' : 'Enable Evolution'}`)
      .setStyle('PRIMARY');
    const form_cycle = new MessageButton()
      .setCustomId(`p_view_cycle,${interaction.id}`)
      .setLabel(`Cycle Forms`)
      .setStyle('PRIMARY');
    if (pokemon.forms < 2) {form_cycle.setDisabled(true)}
    const rare_candy = new MessageButton()
      .setCustomId(`p_rare_candy,${interaction.id}`)
      .setLabel(`Rare Candy - ₽${Math.max(50, pokemon.level * 8)}`)
      .setStyle('PRIMARY');
    if (trainer_info.cash < Math.max(50, pokemon.level * 8)) {rare_candy.setDisabled(true)}
    const close = new MessageButton()
      .setCustomId(`p_view_close,${interaction.id}`)
      .setLabel("Close")
      .setStyle('DANGER');
    buttons.addComponents(evo_toggle, form_cycle, rare_candy, close);

    // Generate embed
    const embed = new MessageEmbed()
      .setTitle(title)
      .setColor(color)
      .setDescription(description + ev_text + stats_block)
      .setImage('attachment://poke_pic.png')
      .setAuthor({name: author})
      .setFooter({ text: `${(pokemon.experience * 100).toFixed(1)}% to next level | Your funds: ₽${trainer_info.cash}` })
      .addFields(
        { name: 'Types', value: field1, inline: true },
        { name: 'Egg Groups', value: field2, inline: true },
        { name: 'Traits', value: field3, inline: true },
    	)
    interaction.editReply({ embeds: [embed], files: [poke_pic], components: [buttons] })

    let filter = button => button.customId.includes(interaction.id);
    let collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 180 * 1000 });

    let responded = false;
    let content;

    collector.on('collect', async i => {
      if (i.user.id === user.id) {
        if (i.customId.split(',')[0] == 'p_view_close') {
          i.reply({content: 'Done viewing Pokemon. Deleting giant embed.', fetchReply: true}).then(msg => {setTimeout(() => msg.delete(), 5000)})
          interaction.fetchReply()
            .then(reply => {setTimeout(() => reply.delete(), 2000)})
            .catch(console.error);
          deactivate_user(interaction.user.id)
        } else if (i.customId.split(',')[0] == 'p_view_cycle') {
          pokemon.formIndex = (pokemon.formIndex + 1) % pokemon.forms
          filename = filename_arr[pokemon.formIndex];
          full_path = assets_dir + filename;
          let new_poke_pic = await getPokePic(full_path, filename, pokemon.shinyShift);
          let cycle_q = `UPDATE data.pokemon_encounters SET formIndex = ? WHERE id = ?`;
          let cycle_v = [pokemon.formIndex, pokemon.id]
          async_query(cycle_q, cycle_v);
          interaction.editReply({files: [new_poke_pic]})
          i.reply({content: `Changed forms! (Form ${pokemon.formIndex + 1}/${pokemon.forms})`, fetchReply: true}).then(msg => {setTimeout(() => msg.delete(), 5000)});
        } else if (i.customId.split(',')[0] == 'p_view_evo') {
          content = `Toggled evolution. Your Pokemon can ${(pokemon.canEvolve) == 1 ? 'no longer evolve!' : 'now evolve!'}`;
          pokemon.canEvolve = 1 - pokemon.canEvolve;
          buttons.components[0].setLabel(`${(pokemon.canEvolve) == 1 ? 'Disable Evolution' : 'Enable Evolution'}`)
          interaction.editReply({components: [buttons]})
          i.reply({content: content, fetchReply: true}).then(msg => {setTimeout(() => msg.delete(), 5000)});
          let update_q = "UPDATE data.pokemon_encounters SET canEvolve = 1 - canEvolve WHERE id = ?;";
          async_query(update_q, [pokemon.id]);
        } else if (i.customId.split(',')[0] == 'p_rare_candy') {
          trainer_info.cash -= Math.max(50, pokemon.level * 8);
          async_query(`UPDATE data.pokemon_trainers SET cash = ? WHERE userId = ?;`, [trainer_info.cash, user.id])
          pokemon.level += 1;
          async_query(`UPDATE data.pokemon_encounters SET level = level + 1 WHERE id = ?;`, [pokemon.id])
          embed.setTitle(pokemon.nick + gender + ` - Lvl. ${pokemon.level}`)
          embed.setFooter({ text: `Your funds: ₽${trainer_info.cash}`});
          buttons.components[2].setLabel(`Rare Candy - ₽${Math.max(50, pokemon.level * 8)}`)
          if (trainer_info.cash < Math.max(50, pokemon.level * 8)) {
            buttons.components[2].setDisabled(true)
          }
          i.update({embeds: [embed], components: [buttons]})
        }
        responded = true;
      } else {
        i.reply({ content: "Don't touch other people's Pokemon!", ephemeral: false });
      }
    });

    collector.on('end', collected => {
      if (!responded) {
        interaction.channel.send(`Deleting giant Pokemon embed.`).then(msg => {setTimeout(() => msg.delete(), 5000)});
        interaction.fetchReply()
          .then(reply => {setTimeout(() => reply.delete(), 2000)})
          .catch(console.error);
        deactivate_user(interaction.user.id)
      }
    });

	}
};

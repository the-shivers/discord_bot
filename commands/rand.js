const { SlashCommandBuilder } = require('@discordjs/builders');
const { async_query } = require('../db/scripts/db_funcs.js');

module.exports = {
	type: "public",
  cat: "utility",
  desc: "Generate a random number between 0 and 1.",
	data: new SlashCommandBuilder()
		.setName('rand')
		.setDescription('Get a random number between 0 and 1'),
	async execute(interaction) {
    let mysql_rand = await async_query('SELECT RAND() AS rand;', []);
    console.log('MYSQL RAND()')
    await interaction.reply({
      //content:String(Math.random()),
      content: String(mysql_rand[0].rand),
      ephemeral: false
    });
	},
};

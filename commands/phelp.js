"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');


module.exports = {
	type: "private",
  cat: "games",
  desc: "Get help with pokemon commands!",
	data: new SlashCommandBuilder()
		.setName('phelp')
		.setDescription('Get help with pokemon commands!'),
	async execute(interaction) {

    let description = `\
    If you're just getting started, go ahead and try \`/pcatch\` and see what happens! If you want more specific help, here's detailed instructions for all the commands in the game.

    \`/pcatch [Optional: generation]\` - This is the basic command for Pokemon. Use this to encounter a Pokemon, then throw a ball at it using one of the buttons. If you're lucky, you'll catch it! This can be used once every two hours, based on GMT time.
    \`/phelp\` - That's this command! What else needs to be said?
    \`/pmart\` - This is a shop which you can spend money at. Curious how to get money? See /ptrain and /prelease.
    \`/prelease [slot]\` - This releases a Pokemon in the given slot. To make sure you're releasing the right Pokemon check using /pteam. You get money based on the rarity of the Pokemon released.
    \`/prename [slot]\` - Nickname the Pokemon in the given slot. To make sure you're naming the right Pokemon, check using /pteam.
    \`/pswap [slot1] [slot2]\` - Rearrange your team, swapping the Pokemon in two slots. Use /pteam to check the slots your Pokemon are in.
    \`/pteam [Optional: target]\` - See your Pokemon team, and which Pokemon are in each slot. This gives you some basic stats about your Pokemon as well. Supply the optional target argument to see another user's team.
    \`/ptiers [generation] [Optional: order]\` - See all the Pokemon in a particular generation along with their rarity. You'll note that only the earliest evolutions in each line are available to be caught!
    \`/ptrade [your_slot] [target] [their_slot]\` - Trade Pokemon with someone. Make sure you get the correct slots with /pteam. This opens a prompt for them which they can accept or reject.
    \`/pcatch [Optional: generation]\` - Similar to /pcatch, only it's daily. Does that make it worse? Not at all. Using this on consecutive days results in rarer Pokemon appearing, getting you more money, and leveling your Pokemon team.
    \`/pview [slot]\` - View detailed stats of one of your Pokemon. Use /pteam to check the slots your Pokemon are in.

    __**Frequently Asked Questions**__
    **1. How do Pokemon evolve?**
    All pokemon evolve via leveling, even those that would require a special condition or elemental stone to evolve in game. Leveling happens just by owning Pokemon or using /train. You can use /pview to see when a Pokemon will evolve. Additionally, if a Pokemon can evolve into multiple Pokemon, the evolution is chosen randomly, so Eevee could evolve into 8 different Pokemon.
    **2. Do I ever get more balls?**
    Balls refresh on the 1st of every month. You can also buy them at the shop with /pmart.
    **3. I used an Ultra Ball and still didn't catch the Pokemon! What gives?**
    It's easy to overlook, but the Ultra Ball takes the *top two dice* of the four dice that are rolled and adds those two. It doesn't simply sum all four dice. This means that the Ultra Ball only has a 32% chance of capturing an 11/12 difficulty Pokemon, so think very carefully before throwing it!
    **4. How is capture difficulty calculated?**
    We roll two 6-sided dice and add them up. On average, this will be about 7, but it could be as low as 2 (in rare case) or as high as 12 (in rare cases). For very common Pokemon, we subtract one from this number. For rare Pokemon, we add one, and for the rarest Pokemon, we add two. Because this means you could end up with a 14/12 difficulty, that could never be caught with a Pokeball, we limit capture difficulty to a maximum of 11/12.`;

    const embed = new MessageEmbed()
      .setTitle(`Pokemon Help!!`)
      .setColor("BLURPLE")
      .setDescription(description);
    await interaction.reply({embeds: [embed]});

	}
}

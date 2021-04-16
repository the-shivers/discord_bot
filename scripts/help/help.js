"use strict";

function help(msg, content) {
  let message = "Every command starts with ! followed by some text. "
  + "All arguments are required besides those in [square brackets]. \n\n"
  + "**!avatar [@mention]** - *Gets the avatar of the mentioned user. If "
  + "you don't mention a user, it fetches your own avatar.*\n"
  + "**!help** - *Shows you this. Shows you information about "
  + "the command if you supply that argument.*\n"
  + "**!prune <n>** - *Prunes the last n messages. Don't go crazy.*\n"
  + "**!smack @mention** - *Smacks somebody!\n"
  + "**!nick @mention <new_nickname>** - *Changes the nickname of the "
  + "mentioned person to new_nickname.*\n"
  + "**!ping** - *Makes the bot say \"Pong!\".*\n"
  + "**!pong** - *Makes the bot say \"Ping!\".*\n"
  + "**!rpg** - *Generates an rpg character.*\n"
  + "**!wa <query>** - *Asks Wolfram Alpha something.*\n"
  + "**!sona** - *Generates a fursona. Yikes warning.*\n"
  + "**!f <various options>** - *Starts a fruitymon command. Run '!f help' "
  + "for details.*\n"
  + "**!bi <query>** - *Uses bing to fetch an image.*\n"
  + "**!bw <query>** - *Uses bing to fetch a web search results.*\n"
  + "**!bn <query>** - *Uses bing to fetch a news results from this week.*\n"
  + "**!tarot [int int int]** - *Draws tarot cards. You can select which "
  + "cards in the deck to draw, or have it be random.*\n"
  + "**!roll [integer]d<integer>** - *!roll 2d6 rolls 2 6-sided dice. "
  + "*(Alias: !r)*\n"
  + "**!ud <search term> [, integer]** - *Finds the definition of search "
  + "term on UrbanDictionary. Example: \"!ud tennis ball, 3\" would return "
  + "the fourth definition for tennis ball (zero-indexed).*";
  msg.channel.send(message);
}

module.exports = { help };

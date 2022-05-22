# discord_bot
It's a node.js bot for discord. What more do you need to know? This bot was completely rebuilt to take advantage of command interactions. Many of the commands rely on APIs to achieve their goals, but many do their own work as well!

## Features
#### Utility
 - /ping - Ping the bot.
 - /av - Fetch a user's avatar.
 - /prune - Remove messages.
 - /bi - Bing images.
 - /gi - Google images.
 - /rand - Generate random decimal between 0 and 1.
 - /rename - Change someone's nickname.
 - /weather - Find the weather of a location.
 - /ud - Look up definitions on urban dictionary.
 - /roll - Roll some dice.
 - /coin - Flip a coin.

#### Fun
 - /grid - Plot the server's users on two axes.
 - /smack - Smack someone! (Context menu-based)
 - /wwtbam - Elaborate game of Who Wants to Be A Millionaire!
 - /sona - Generate a satirical "fursona"
 - /tarot - Get a three-card tarot reading
 - /mock - Mock someone's message. (Context menu-based)
 - /hurt - Deal some damage, or heal someone if you're feeling kind.
 - /pcatch - Catch pokemon.
 - /pteam - See your pokemon team.
 - /prelease - Release a pokemon
 - /prename - Rename a pokemon

#### Image Manipulation
 - /mirror - Mirror an image
 - /swirl - Swirl an image
 - /ca - Liquid resize (content aware)
 - /hue - Hue shift
 - /turn - .gif of image flipping back and forth.

#### Wishlist
These are things I'll probably add in the future, when I get around to it.
 - /remind
 - Further image manipulation: /rotate, /spin, /bw, /sepia, /stamp
 - Fix from the old version: /crypto, /wolfram
 - /stock or /ticker
 - Additional games: /familyfeud, /deal (or no deal)
 - /song (ambitious part-writing harmony generator)

#### Other To Do
 - Fix mirror north and east - they mess up for transparent images!
 - Change mysql connection to pooled, or at least fix disconnect issue with better error handling. `Error: Connection lost: The server closed the connection.`
 - Refactor code - kill and the image code is in need of consolidation since a lot of code is copied and pasted
 - Rehost bot somewhere decent

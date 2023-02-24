"use strict";

// Constants
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Canvas = require('canvas');
const { async_query } = require('../db/scripts/db_funcs.js')
const ASSETS_DIR = './assets/pokemon/thumbnails/';
const f = require('../funcs.js');
const { getHueMatrix, applyHueMatrix, getValue } = require('../assets/pokemon/poke_funcs.js');
const fs = require('fs');
let server_filenames = fs.readdirSync(ASSETS_DIR)

const QUERY = "SELECT pe.*, p.evStage, p.baseFreq FROM data.pokemon_encounters AS pe JOIN data.pokedex AS p ON pe.pokemonId = p.pokemonId WHERE userId = ? AND owned = 1 ORDER BY slot ASC;";


class InteractionPage {
  async enter(ctx) {}
  async exit(ctx) {}
  async generate_message(ctx) {
    return { content: "Page not implemented" };
  }
  async generate_embed(ctx) { return {}; }
  async generate_components(ctx) { return []; }
  async generate_files(ctx) { return {}; }
  async do_action(ctx, option, args) {}
}


class OverviewPage extends InteractionPage {
  data_cache
  show_values

  construct(interaction) {
    this.show_values = false;
  }

  async generate_message(ctx) {
    /* data_cache is filled during embed generation, then used when creating files */
    self.data_cache = [];
    let embed = self.generate_embed(ctx);
    let components = self.generate_components(ctx);
    let files = self.generate_files(ctx);

    delete self.data_cache;

    return { embeds: [embed], components: components, files, files };
  }

  async generate_embed(ctx) {
    let desc = '';
    let gender_symbol = '';
    for (let i = 0; i < team.length; i++) {
        let pokemon = team[i];

        let server_filename_arr = server_filenames.filter(filename => filename.startsWith(pokemon.pokemonId.toString().padStart(3, '0')));
        server_filename_arr.unshift(server_filename_arr.pop());

        /* Determine data to create picture. */
        let entry = pokemon.level > 0
        ? { // If above level 0
          filename: server_filename_arr[pokemon.formIndex],
          shiny_shift: pokemon.shinyShift
        }
        : { // If below level 0
          filename: 'egg_thumbnail.png',
          shiny_shift: 0
        };

        self.data_cache.push(entry);

        if (pokemon.gender == 'male') {
          gender_symbol = '\♂';
        } else if (pokemon.gender == 'female') {
          gender_symbol = '\♀';
        }
        desc += (i + 1) + '. ' + pokemon.nick + ' | ' + pokemon.name + `\\${gender_symbol}`;
        desc += " | Lvl. " + (pokemon.level);
        if (self.show_values) {
          desc += ` | ₽${getValue(pokemon)}`
        } else {
          if (!self.show_values && pokemon.level > 0) {
            desc += " | `" + pokemon.pokemonChar1 + "`, `" + pokemon.pokemonChar2 + "`\n"
          } else {
            desc += " | `???`, `???`\n"
          }
      }
    }
    const embed = new MessageEmbed()
      .setTitle(`${user.username}'s Pokemon team!`)
      .setColor("#c03028")
      .setDescription(desc)
      .setImage('attachment://team_pic.png');

    return { embed };
  }

  async generate_components(ctx) {
    const action_row_0 = new MessageActionRow();
    const show_values = new MessageButton()
      .setCustomId(`show_values,${interaction.id}`)
      .setLabel(`Show values`)
      .setStyle('PRIMARY');
    const show_characteristics = new MessageButton()
      .setCustomId(`show_characteristics,${interaction.id}`)
      .setLabel(`Show Characteristics`)
      .setStyle('PRIMARY');

    action_row_0.addComponents(self.show_values ? show_characteristics : show_values);
    return [action_row_0];
  }

  async generate_files(ctx) {
    // Increase height by 100px based on length of array using integer division.
    let amount = ~~((self.data_cache.length - 1) / 6) + 1;
    let canvas = Canvas.createCanvas(625, amount * 100);
    const canvas_ctx = canvas.getContext('2d');

    for (let i = 0; i < data.length; i++) {
      const { filename, shiny_shift } = self.data_cache[i];
      let y_start = ~~(i / 6) * 100;
      let x_pnlty = ~~(i / 6) * -600;

      let img = await Canvas.loadImage(ASSETS_DIR + filename);
      canvas_ctx.drawImage(img, i * 100 + x_pnlty, y_start, 100, 100);

      if (shiny_shift != 0) {
        let img_data = canvas_ctx.getImageData(i * 100 + x_pnlty, y_start, 100, 100);
        let new_img_data = canvas_ctx.getImageData(i * 100 + x_pnlty, y_start, 100, 100);

        for (let j = 0; j < 100 * 100; j++) {
          let matrix = getHueMatrix(shiny_shift)
          let pos = j * 4;
          let new_rgb = applyHueMatrix(matrix, img_data.data[pos], img_data.data[pos+1], img_data.data[pos+2]);
          new_img_data.data[pos] = new_rgb[0];
          new_img_data.data[pos+1] = new_rgb[1];
          new_img_data.data[pos+2] = new_rgb[2];
        }

        canvas_ctx.putImageData(new_img_data, i * 100 + x_pnlty, y_start)
      }
    }

    let attach = new MessageAttachment(canvas.toBuffer(), 'team_pic.png');
    return [attach]
  }

  async do_action(ctx, option, args) {

    switch (option) {
      case "show_characteristics":
        self.show_values = false;
        break;
      case "show_values":
        self.show_values = true;
        break;
    }

    let reply = await self.current_page.generate_message(ctx)

    ctx.command.editReply(reply);
  }
}


class InteractionHandler {
  /* Variables */
  context
  current_page
  page_list
  target_user

  /* Methods */
  constructor(command) {
    self.page_list = {
      'overview': new OverviewPage()
    }
    /* Will be used to changing page using arrows in case there are too many pages to
     * fit on navigation header. */
    self.pages = [
      self.page_list['overview']
    ];

    self.current_page = null;
    self.context = {
      "command": command,
      "target_user": command.options.getUser('target') ?? command.user,
      "team": null,
      "interaction": null
    };
  }

  /* Can't make constructor async so call this to update ctx and start the whole thing */
  async init() {
    await self.update_context(null);

    if (self.context.team.length === 0) {
      throw(Error("You don't have any Pokemon! Try catching one with `/pcatch`!"));
    }

    await self.change_page('overview');
  }

  /* Ensure that data is up to date before passing along to pages by calling this. */
  async update_context(interaction) {
    let values = [self.command.user.id]
    let team = await async_query(QUERY, values);

    self.context.team = team;
    self.context.interaction = interaction;
  }

  /* Listener for the collect event, could maybe move creating the listener inside of
   * this class */
  async on_collect(interaction) {
    if (interaction.user.id !== self.command.user.id) {
      interaction.reply({ content: "You can't just poke someone else's team embed...", ephemeral: true });
      return;
    }

    /* Update on every action */
    await self.update_context(interaction);

    let args = custom_id.split(',');
    /* Every action should return at least an option */
    let option = args.shift();

    /* Global options can defined here, else pass the option and args to current page. */
    switch (option) {
      case "change_page":
        self.change_page(args);
        break;
      case "quit_overview":
        break;
      default:
        self.current_page.do_action(self.context, option, args);
        break;
    }
  }

  /* Go to a new page by name then handle exiting/entering states and updating message. */
  async change_page(args) {
    let page_name = args.shift();

    if (self.current_page !== null) {
      /* Call a clean up function if it exists */
      await self.current_page.exit(self.ctx);
    }

    self.current_page = self.page_list[page_name];
    await self.current_page.enter(self.ctx, args);

    let reply = await self.current_page.generate_message(self.ctx)

    self.context.command.editReply(reply);
  }
}


module.exports = {
  type: "private",
  cat: "games",
  desc: "See an overview of your Pokemon team!",
	data: new SlashCommandBuilder()
		.setName('poverview')
		.setDescription('Show your Pokemon team!')
    .addUserOption(option => option
      .setName('target')
      .setDescription('Pokemon team to look at (defaults to your own)')
      .setRequired(false)
    ),
	async execute(interaction) {
    let msg = await interaction.deferReply();

    try {
      let interaction_handler = await new InteractionHandler(interaction).init();
      let collector = msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 300 * 1000 });

      // Wait for interactions
      collector.on('collect', i => {
        interaction_handler.on_collect(i);
      });

      collector.on('end', i => {
      });
    }
    catch(err) {
      console.error(err);
      interaction.reply({ content: err.message, ephemeral: true });
    }
	}
};

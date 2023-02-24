"use strict";

module.exports = {
  async execute(interaction) {
    interaction.reply({
      content: "Maybe next time!", ephemeral: true
    });
  }
}

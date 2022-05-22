"use strict";
const msg_limit = 20;

async function get_msgs(interaction) {
  return interaction.channel.messages.fetch({ limit: msg_limit});
}

function get_img_details(msgs) {
  let url = '';
  let width = 0;
  let height = 0;
  let shouldSkip = false; // Because we can't break
  msgs.forEach(msg => {
    if (msg.embeds.length > 0 && !shouldSkip) {
      if (
        msg.embeds[0].type == 'image' &&
        !(msg.embeds[0].thumbnail.url).includes('.webp')
      ) {
        url = msg.embeds[0].thumbnail.url;
        width = msg.embeds[0].thumbnail.width;
        height = msg.embeds[0].thumbnail.height;
        shouldSkip = true;
      } else if (msg.embeds[0].type == 'rich') {
        if (msg.embeds[0].image !== null && !(msg.embeds[0].image.url.includes('.webp'))) {
          url = msg.embeds[0].image.url;
          width = msg.embeds[0].image.width;
          height = msg.embeds[0].image.height;
          shouldSkip = true;
        } else if (msg.embeds[0].thumbnail !== null && !(msg.embeds[0].thumbnail.url.includes('.webp'))) {
          url = msg.embeds[0].thumbnail.url;
          width = msg.embeds[0].thumbnail.width;
          height = msg.embeds[0].thumbnail.height;
          shouldSkip = true;
        }
      }
    }
    if (msg.attachments.size > 0 && !shouldSkip) {
      if (['image/jpeg', 'image/png', 'image/gif'].includes(msg.attachments.first().contentType)) {
        url = msg.attachments.first().url;
        width = msg.attachments.first().width;
        height = msg.attachments.first().height;
        shouldSkip = true;
      }
    }
  })
  return({'url': url, 'width': width, 'height': height})
}

module.exports = {get_img_details, get_msgs}

const { SlashCommandBuilder } = require('@discordjs/builders');
const { getStats, getPokePic } = require('../assets/pokemon/poke_funcs.js');
const {
  MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu
} = require('discord.js');
const assets_dir = './assets/pokemon/';
const { async_query } = require('../db/scripts/db_funcs.js')
const Canvas = require('canvas');
const f = require('../funcs.js');
const config = require('../assets/pokemon/poke_info.json')
const leader_lvls = [15, 21, 27, 33, 39, 46, 53, 60, 67, 74, 81, 88, 100];
const phys_words = [
  'Tap', 'Hug', 'Rub', 'Lick',
  'Scratch', 'Threat', 'Yank', 'Push', 'Pull', 'Pounce',
  'Blitz', 'Rush', 'Bite', "Wing", "Tail", 'Thrust', 'Charge', 'Stomp', 'Slap',
  'Shove', 'Throw', 'Kick', 'Strike', "Pound", "Whip", "Claw", "Fang", 'Attack', 'Tackle',
  'Assault', 'Storm', 'Bombard', 'Barrage', 'Snipe', 'Slam', 'Hammer', "Mash", "Blade",
  'Onslaught', 'Stab', 'Choke', 'Curbstomp', 'Mutilate', 'Murder', 'Genocide'
]
let special_words = [
  'Aroma', 'Laugh', 'Smile', 'Flirt', 'Kiss', 'Stare', 'Screech', 'Dance', 'Song', 'Feelings',
  'Threat', 'Haze', 'Breath', 'Dreams', 'Gust', 'Wind', 'Roar', 'Powder',
  'Drain', 'Sludge', 'Acid', 'Power', 'Sphere', 'Ball', 'Shackle',
  'Aura', 'Wave', 'Ray', 'Pump', 'Quake',
  'Blast', 'Beam', 'Explosion', 'Torment', 'Nightmare'
]

async function canUserTrain(userId, curr_epoch_s) {
  let last_battle_result = await async_query(
    "SELECT * FROM data.pokemon_battles WHERE userId = ? ORDER BY epoch DESC;",
    [userId]
  );
  if (last_battle_result.length > 0) {
    let chunk = new Date(curr_epoch_s * 1000);
    chunk.setHours(0);
    chunk.setMinutes(0);
    chunk.setSeconds(0);
    chunk.setDate(chunk.getDate() + 1);
    let n_epoch = chunk.getTime();
    chunk.setDate(chunk.getDate() - 1);
    let l_epoch = chunk.getTime();
    if (trainer_result[0].lastTrainEpoch * 1000 < l_epoch) {
      return {status: true, msg: ''}
    } else {
      let remaining_seconds = Math.floor((n_epoch - curr_epoch_s * 1000) / 1000);
      let minutes = Math.floor(remaining_seconds / 60);
      let seconds = Math.floor(remaining_seconds - (minutes * 60));
      return {status: false, msg: `You have to wait ${minutes} minutes and ${seconds} seconds to battle again!`}
    }
  } else {
    return {status: true, msg: ''}
  }
}

async function getLeaderTeam(gymLevel) {
  let leader_result = await async_query(
    "SELECT * FROM data.gym_leader_pokemon WHERE gymLevel = ? ORDER BY RAND();",
    [gymLevel]
  )
  let leader_name = leader_result[0].leaderName;
  let leader_id_arr = [];
  for (let i = 0; i < leader_result.length; i++) {
    if (leader_result[i].leaderName == leader_name) {
      leader_id_arr.push(leader_result[i].pokemonId)
      if (leader_id_arr.length == 6) {break}
    }
  }
  let leader_team = [];
  let user_team = [];
  for (let i = 0; i < leader_id_arr.length; i++) {
    let pkmn_pokedex = await async_query("SELECT * FROM data.pokedex WHERE pokemonId = ?;", [leader_id_arr[i]])
    let rand_level = Math.min(leader_lvls[gymLevel - 1] + Math.ceil((Math.random() - .5) * 14), 100);
    let rand_epoch = Math.ceil(Math.random() * 10000);
    let stats = getStats(rand_epoch, rand_level, pkmn_pokedex[0]);
    leader_team.push(
      {
        pokemonId: leader_id_arr[i],
        name: pkmn_pokedex[0].name,
        nick: 'Enemy ' + pkmn_pokedex[0].name,
        type1: pkmn_pokedex[0].type1,
        type2: pkmn_pokedex[0].type2,
        level: rand_level,
        isShiny: false,
        shinyShift: 0,
        currentHealth: stats.hp.val,
        hp: stats.hp.val,
        attack: stats.attack.val,
        defense: stats.defense.val,
        spAttack: stats.spAttack.val,
        spDefense: stats.spDefense.val,
        speed: stats.speed.val
      }
    )
  }
  return [leader_name, leader_team]
}

async function getUserTeam(query_result) {
  let user_team = [];
  for (let i = 0; i < query_result.length; i++) {
    let stats = getStats(query_result[i].epoch, query_result[i].level, query_result[i]);
    user_team.push(
      {
        pokemonId: query_result[i].pokemonId,
        name: query_result[i].name,
        nick: query_result[i].nick,
        type1: query_result[i].type1,
        type2: query_result[i].type2,
        level: query_result[i].level,
        isShiny: query_result[i].isShiny == 1,
        shinyShift: query_result[i].shinyShift,
        currentHealth: stats.hp.val,
        hp: stats.hp.val,
        attack: stats.attack.val,
        defense: stats.defense.val,
        spAttack: stats.spAttack.val,
        spDefense: stats.spDefense.val,
        speed: stats.speed.val
      }
    )
  }
  return user_team
}

async function getBattlefield(user_team, leader_team, user_damaged, target_damaged, user_absent, target_absent) {
  let canvas = Canvas.createCanvas(800, 400);
  let ctx = canvas.getContext('2d');
  let bg = await Canvas.loadImage(assets_dir + 'battlefield.png');
  let health_slice_1 = await Canvas.loadImage(assets_dir + 'health_slice.png');
  let dead_ball = await Canvas.loadImage(assets_dir + 'dead_ball.png');
  let full_ball = await Canvas.loadImage(assets_dir + 'full_ball.png');
  let pow = await Canvas.loadImage(assets_dir + 'pow.png');
  let crit = await Canvas.loadImage(assets_dir + 'crit.png');
  let offset = 20; // Fix rounded corners
  ctx.drawImage(bg, offset, 0);
  // enemy health
  if (leader_team.length > 0) {
    for (let i = 0; i < Math.ceil(163 * leader_team[0].currentHealth / leader_team[0].hp); i++) {
      ctx.drawImage(health_slice_1, offset + 53 + i, 90);
    }
  }
  // user health
  if (user_team.length > 0) {
    for (let i = 0; i < Math.ceil(163 * user_team[0].currentHealth / user_team[0].hp); i++) {
      ctx.drawImage(health_slice_1, offset + 421 + i, 327);
    }
  }
  // enemy balls
  for (let i = 0; i < 6; i++) {
    if (i < leader_team.length) {
      ctx.drawImage(full_ball, offset + 9 + (27 * i), 118);
    } else {
      ctx.drawImage(dead_ball, offset + 9 + (27 * i), 118);
    }
  }
  // user balls
  for (let i = 0; i < 6; i++) {
    if (i < user_team.length) {
      ctx.drawImage(full_ball, offset + 569 - (27 * i), 355);
    } else {
      ctx.drawImage(dead_ball, offset + 569 - (27 * i), 355);
    }
  }
  // pokemon placement
  if (!user_absent) {
    let user_pkmn = await Canvas.loadImage(assets_dir + 'images/' + `${user_team[0].pokemonId.toString().padStart(3, '0')}.png`);
    ctx.drawImage(user_pkmn, offset + 43, 194, 200, 200)
  }
  if (!target_absent) {
    let leader_pkmn = await Canvas.loadImage(assets_dir + 'images/' + `${leader_team[0].pokemonId.toString().padStart(3, '0')}.png`);
    ctx.drawImage(leader_pkmn, offset + 375, 104, 175, 175)
  }
  // damage pows
  if (user_damaged == 'crit') {
    ctx.drawImage(crit, offset + 86, 228)
  } else if (user_damaged.length > 0) {
    ctx.drawImage(pow, offset + 86, 228)
  } else if (target_damaged == 'crit') {
    ctx.drawImage(crit, offset + 387, 112)
  } else if (target_damaged.length > 0) {
    ctx.drawImage(pow, offset + 387, 112)
  }
  // create and return attachment
  let attach = new MessageAttachment(canvas.toBuffer(), 'battlefield.png');
  return attach
}

function dealDamage(attacker, defender) {
  // determine attack type
  let attack_type;
  if (attacker.type2 == '') {
    attack_type = attacker.type1
  } else {
    let type_arr = [attacker.type1, attacker.type2]
    attack_type = type_arr[Math.floor(Math.random() * 2)]
  }
  console.log('attack_type' ,attack_type)
  // determine phys/special
  let attack_stat, defense_stat;
  if (Math.ceil(Math.random() * (attacker.attack + attacker.spAttack)) > attacker.attack) {
    attack_stat = 'spAttack'
    defense_stat = 'spDefense'
  } else {
    attack_stat = 'attack'
    defense_stat = 'defense'
  }
  console.log('attack_stat',attack_stat)
  // determine attack strength
  let strength_rand = Math.random()
  let bp = Math.ceil(60 + strength_rand * 120)
  console.log('bp',bp)
  // determine effectiveness
  let effectiveness = 1;
  let type_info = config.types[attack_type]
  if (type_info.immunes.includes(defender.type1)) {
    effectiveness *= 0.25
  } else if (type_info.weaknesses.includes(defender.type1)) {
    effectiveness *= 0.5
  } else if (type_info.strengths.includes(defender.type1)) {
    effectiveness *= 2
  }
  if (defender.type2 != '' && type_info.immunes.includes(defender.type2)) {
    effectiveness *= 0.25
  } else if (defender.type2 != '' && type_info.weaknesses.includes(defender.type2)) {
    effectiveness *= 0.5
  } else if (defender.type2 != '' && type_info.strengths.includes(defender.type2)) {
    effectiveness *= 2
  }
  console.log('effectiveness',effectiveness)
  // determine criticality
  let critMult = (Math.ceil(Math.random() * 10) == 10) ? 2 : 1;
  let critStr = (critMult == 2) ? 'crit' : 'standard';
  console.log('critMult',critMult)
  // damage
  let damage = Math.ceil(((((2 * attacker.level / 5) * bp * attacker[attack_stat] / defender[defense_stat]) / 50) + 2) * critMult * effectiveness * ((Math.ceil(Math.random() * 16) + 84) / 100))
  console.log('damage',damage)
  // determine death
  let isDeath = damage >= defender.currentHealth;
  // determine message
  let adjective = type_info.adjectives[Math.floor(Math.random() * type_info.adjectives.length)]
  let verb;
  if (attack_stat == 'attack') {
    verb = phys_words[Math.floor(strength_rand * phys_words.length)]
  } else {
    verb = special_words[Math.floor(strength_rand * special_words.length)]
  }
  let msg = `${attacker.nick} used ${adjective} ${verb}!`
  if (effectiveness > 1) {
    msg += ` It's super effective!`
  } else if (effectiveness < 1) {
    msg += ` It's not very effective...`
  }
  if (critMult > 1) {
    msg += ` Critical hit!`
  }
  return [damage, critStr, msg]
}

function limitDesc(desc) {
  return desc.slice(Math.max(0, desc.length - 4000))
}

async function generateGymBattleEmbed(interaction, leader_name, user_team, leader_team) {
  let th_filename = leader_name.toLowerCase() + '.png';
  let th_img_src = assets_dir + th_filename;
  let th_image = new MessageAttachment(th_img_src, th_filename);
  let battlefield = await getBattlefield(user_team, leader_team, '', '', false, false)
  let desc = `${leader_name.toUpperCase()} sent out ${leader_team[0].name} (lvl ${leader_team[0].level})!\n${interaction.user.username} sent out ${user_team[0].nick} (lvl ${user_team[0].level})!`;
  const embed = new MessageEmbed()
    .setTitle(`${interaction.user.username} challenged ${leader_name.toUpperCase()} to a battle!`)
    .setColor('RED')
    .setDescription(desc)
    .setThumbnail('attachment://' + th_filename)
    .setImage('attachment://battlefield.png');
  return {embeds: [embed], files: [th_image, battlefield], ephemeral: false, fetchReply: true}
}

async function gymBattle(interaction, userId, user_pkmn) {
  let last_gym_battle_result = await async_query(
    "SELECT * FROM data.pokemon_battles WHERE userId = ? AND type = 'gym' ORDER BY epoch DESC;",
    [userId]
  );
  let gym_level = 1;
  if (last_gym_battle_result.length > 0) {
    if (last_gym_battle_result[0].userWon == 1) {
      gym_level = last_gym_battle_result[0].gymLevel + 1;
    } else {
      gym_level = last_gym_battle_result[0].gymLevel;
    }
  }
  let leader_info = await getLeaderTeam(gym_level)
  let leader_name = leader_info[0]
  let leader_team = leader_info[1]
  let user_team = await getUserTeam(user_pkmn)
  let response_data = await generateGymBattleEmbed(interaction, leader_name, user_team, leader_team)
  interaction.editReply(response_data)
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Core battle Loop
  console.log(user_team[0], '\n', leader_team[0])
  let new_embed = response_data.embeds[0]
  let userTurn = user_team[0].speed > leader_team[0].speed;
  while (leader_team.length > 0 && user_team.length > 0) {
    let damage_info;
    if (userTurn) {
      damage_info = dealDamage(user_team[0], leader_team[0])
      // damage animation and message
      let new_battlefield = await getBattlefield(user_team, leader_team, '', damage_info[1], false, false)
      new_embed.setDescription(limitDesc(new_embed.description + '\n' + damage_info[2]));
      interaction.editReply({embeds: [new_embed], files: [response_data.files[0], new_battlefield]})
      await new Promise(resolve => setTimeout(resolve, 1000));
      // update health
      leader_team[0].currentHealth = Math.max(0, leader_team[0].currentHealth - damage_info[0])
      new_battlefield = await getBattlefield(user_team, leader_team, '', '', false, false)
      interaction.editReply({files: [response_data.files[0], new_battlefield]})
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Death logic
      if (leader_team[0].currentHealth < 1) {
        // Make pokemon disappear, faint message, ball update.
        let faint_msg = leader_team[0].nick + ' fainted!'
        leader_team = leader_team.slice(1);
        new_embed.setDescription(limitDesc(new_embed.description + '\n' + faint_msg));
        new_battlefield = await getBattlefield(user_team, leader_team, '', '', false, true)
        interaction.editReply({embeds: [new_embed], files: [response_data.files[0], new_battlefield]})
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Defeated / Send out new pokemon.
        let new_msg;
        if (leader_team.length > 0) {
          new_msg = `${leader_name.toUpperCase()} sent out ${leader_team[0].name} (lvl ${leader_team[0].level})!`
          new_battlefield = await getBattlefield(user_team, leader_team, '', '', false, false)
        } else {
          new_msg = `${leader_name.toUpperCase()} is out of usable Pokemon!\n${leader_name.toUpperCase()} was defeated!`
        }
        new_embed.setDescription(limitDesc(new_embed.description + '\n' + new_msg));
        interaction.editReply({embeds: [new_embed], files: [response_data.files[0], new_battlefield]})
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      userTurn = !userTurn
      continue
    } else {
      damage_info = dealDamage(leader_team[0], user_team[0])
      // damage animation and message
      let new_battlefield = await getBattlefield(user_team, leader_team, damage_info[1], '', false, false)
      new_embed.setDescription(limitDesc(new_embed.description + '\n' + damage_info[2]));
      interaction.editReply({embeds: [new_embed], files: [response_data.files[0], new_battlefield]})
      await new Promise(resolve => setTimeout(resolve, 1000));
      // update health, flip pokemon if necessary
      user_team[0].currentHealth = Math.max(0, user_team[0].currentHealth - damage_info[0])
      new_battlefield = await getBattlefield(user_team, leader_team, '', '', false, false)
      interaction.editReply({files: [response_data.files[0], new_battlefield]})
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Death logic
      if (user_team[0].currentHealth < 1) {
        // Make pokemon disappear, faint message, ball update.
        let faint_msg = user_team[0].nick + ' fainted!'
        user_team = user_team.slice(1);
        new_embed.setDescription(limitDesc(new_embed.description + '\n' + faint_msg));
        new_battlefield = await getBattlefield(user_team, leader_team, '', '', true, false)
        interaction.editReply({embeds: [new_embed], files: [response_data.files[0], new_battlefield]})
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Defeated / Send out new pokemon.
        let new_msg;
        if (user_team.length > 0) {
          new_msg = `${interaction.user.username} sent out ${user_team[0].nick} (lvl ${user_team[0].level})!`
          new_battlefield = await getBattlefield(user_team, leader_team, '', '', false, false)
        } else {
          new_msg = `${interaction.user.username} is out of usable Pokemon!\n${interaction.user.username} was defeated!`
        }
        new_embed.setDescription(limitDesc(new_embed.description + '\n' + new_msg));
        interaction.editReply({embeds: [new_embed], files: [response_data.files[0], new_battlefield]})
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      userTurn = !userTurn
      continue
    }

  }
}


module.exports = {
	type: "private",
  cat: "games",
  desc: "Battle Gym Leaders or other players!",
	data: new SlashCommandBuilder()
		.setName('pbattle')
		.setDescription('Battle Gym Leaders or other players!')
    .addUserOption(option => option
      .setName('target')
      .setDescription('Leave blank to battle Gym Leaders.')
    ),
	async execute(interaction) {
    await interaction.deferReply();
    let curr_epoch_s = Math.floor(new Date().getTime() / 1000);
    let userId = interaction.user.id;
    let trainInfo = await canUserTrain(userId, curr_epoch_s);
    if (!trainInfo.status) {
      interaction.editReply(trainInfo.msg)
      return
    }
    let user_pkmn = await async_query("SELECT pe.*, p.hp, p.attack, p.defense, p.spAttack, p.spDefense, p.speed, p.type1, p.type2 FROM data.pokemon_encounters AS pe LEFT JOIN data.pokedex AS p ON pe.pokemonId = p.pokemonId WHERE pe.userId = ? AND pe.owned = 1 ORDER BY pe.slot ASC LIMIT 6;", [userId])
    if (user_pkmn.length == 0) {
      interaction.editReply("You need pokemon before you can battle! Catch some with /pcatch!")
      return;
    }
    let target = interaction.options.getString('target') ?? 'gym';
    if (target === 'gym') {
      gymBattle(interaction, userId, user_pkmn)
    } else {
      interaction.editReply("Not ready yet!")
      // let target_pkmn = async_query("SELECT * FROM data.pokemon_encounters WHERE userId = ? AND owned = 1 ORDER BY slot ASC;", [target.id])
      // userBattle(interaction, userId, user_pkmn, target.id, target_pkmn)
    }
	}
};

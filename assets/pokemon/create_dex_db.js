var pokedex = require('./pokedex.json').pokemon;
var gen_bounds = require('./config.json').gens;
const { async_query } = require('../../db/scripts/db_funcs.js')
var fs = require('fs');

// For testing;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function pokeloop() {
  for (let i = 0; i < pokedex.length; i++) {
    let pokemon = pokedex[i];
    // Get each column for our table
    let pokemonId = pokemon.id;
    let name = pokemon.name.english;
    let frenchName = pokemon.name.french;
    let type1 = pokemon.type[0];
    let type2 = pokemon.type[1] || '';
    let hp  = pokemon.base.HP;
    let attack = pokemon.base.Attack;
    let defense = pokemon.base.Defense;
    let spAttack = pokemon.base['Sp. Attack'];
    let spDefense  = pokemon.base['Sp. Defense'];
    let speed = pokemon.base.Speed;
    let species = pokemon.species;
    let description = pokemon.description;
    let evIds = ''; // Done below.
    let evLevel = null; // Done below
    let height = parseFloat(pokemon.profile.height.split(' ')[0]);
    let weight = parseFloat(pokemon.profile.weight.split(' ')[0]);
    let egg1 = pokemon.profile.egg[0];
    let egg2  = pokemon.profile.egg[1] || '';
    let ability1 = pokemon.profile.ability[0][0];
    let ability2 = '';
    let ability3 = '';
    let pctMale = null; // Done below
    let gender = pokemon.profile.gender;
    let frequency = pokemon.frequency;
    let gen;
    let genInt; // Done below

    //
    if (i + 1 <= gen_bounds.I.max) {
      gen = 'I';
      genInt = 1;
    } else if (i + 1 <= gen_bounds.II.max) {
      gen = 'II';
      genInt = 2;
    } else if (i + 1 <= gen_bounds.III.max) {
      gen = 'III';
      genInt = 3;
    } else if (i + 1 <= gen_bounds.IV.max) {
      gen = 'IV';
      genInt = 4;
    } else if (i + 1 <= gen_bounds.V.max) {
      gen = 'V';
      genInt = 5;
    } else if (i + 1 <= gen_bounds.VI.max) {
      gen = 'VI';
      genInt = 6;
    } else {
      gen = 'VII';
      genInt = 7;
    }

    // Ability data.
    if (pokemon.profile.ability.length > 1) {
      ability2 = pokemon.profile.ability[1][0];
    }
    if (pokemon.profile.ability.length > 2) {
      ability3 = pokemon.profile.ability[2][0];
    }

    // Evolution data.
    let level_acquired = false;
    if ("next" in pokemon.evolution) {
      for (let j = 0; j < pokemon.evolution.next.length; j++) {
        evIds += pokemon.evolution.next[j][0] + '|';
        if (!level_acquired) {
          if (pokemon.evolution.next[j][1].includes('evel')) {
            evLevel = parseInt(pokemon.evolution.next[j][1].replace(/[^0-9]/g,''));
            level_acquired = true;
          }
        }
      }
      if (!level_acquired) {
        if ("prev" in pokemon.evolution) {
          if (pokemon.evolution.prev[0][1].includes('evel')) {
            let temp = parseInt(pokemon.evolution.prev[0][1].replace(/[^0-9]/g,''))
            evLevel = temp + 15;
          } else {
            evLevel = 55;
          }
        } else {
          evLevel = 45;
        }
      }
      evIds = evIds.slice(0, -1);
    }

    // Gender data
    if (gender.includes(":")) {
      pctMale = parseFloat(gender.split(":")[0])
    }

    // Print each pokemon for verification
    console.log(`
      pokemonId: ${pokemonId}
      name: ${name}
      frenchName: ${frenchName}
      type1: ${type1}
      type2: ${type2}
      hp: ${hp}
      attack: ${attack}
      defense: ${defense}
      spAttack: ${spAttack}
      spDefense: ${spDefense}
      speed: ${speed}
      species: ${species}
      description: ${description}
      evIds: ${evIds}
      evLevel: ${evLevel}
      height: ${height}
      weight: ${weight}
      egg1: ${egg1}
      egg2: ${egg2}
      ability1: ${ability1}
      ability2: ${ability2}
      ability3: ${ability3}
      pctMale: ${pctMale}
      gender: ${gender}
      frequency: ${frequency}
      gen: ${gen}
      genInt: ${genInt}\n\n
    `)

    let query = 'INSERT INTO data.pokedex VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
    query += ', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    let values = [
      pokemonId, name, frenchName, type1, type2, hp, attack, defense, spAttack,
      spDefense, speed, species, description, evIds, evLevel, height, weight,
      egg1, egg2, ability1, ability2, ability3, pctMale, gender, frequency,
      gen, genInt
    ];
    await async_query(query, values);
    //await sleep(10 * 1000);
  }
}

pokeloop();

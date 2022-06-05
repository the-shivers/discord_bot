"use strict";

// Constants
const { async_query } = require('../../db/scripts/db_funcs.js')

async function plevels() {
	let query = 'SELECT pe.*, p.evIds, p.evLevel FROM data.pokemon_encounters AS pe LEFT JOIN data.pokedex AS p ON pe.pokemonId = p.pokemonId WHERE pe.owned = 1 AND pe.level < 100;';
	let result = await async_query(query, []);
  let dex_query = 'SELECT * FROM data.pokedex ORDER BY pokemonId ASC;';
  let dex = await async_query(dex_query, []);
	for (let i = 0; i < result.length; i++) {
		// if (result[i].userId != 790037139546570802) {continue}
		// console.log(result[i].name, result[i].level, result[i].experience)
    let new_level = result[i].level;
    let increment = 1/24;
		let new_exp = result[i].experience + increment;
    if (new_exp > 1) {
      new_level += 1;
      new_exp = 0;
    }
    // Evolution logic
    let new_id = result[i].pokemonId;
    let new_name = result[i].name;
    if (result[i].evIds.length > 0 && new_level >= result[i].evLevel) {
      let ev_ids_arr = result[i].evIds.split('|')
      new_id = ev_ids_arr[Math.floor(Math.random() * ev_ids_arr.length)]
      let ev_pokemon_row = dex[new_id - 1]
      new_name = ev_pokemon_row.name;

			let insert_query = `
			INSERT INTO data.pokemon_encounters (
				userId, pokemonId, name, nick, level, experience, gender, pokemonChar1,
				pokemonChar2, isShiny, shinyShift, attempted, caught, owned,
				captureDifficulty, slot, epoch, isTraining, isRadar
			)
			VALUES (
				?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
			);
			`;
			let insert_vals = [
				result[i].userId, new_id, new_name, result[i].nick, new_level, 0,
				result[i].gender, result[i].pokemonChar1, result[i].pokemonChar2,
				result[i].isShiny, result[i].shinyShift, '', 1, 1,
				result[i].captureDifficulty, result[i].slot, result[i].epoch,
				0, 0
			]
	    let update_query = "UPDATE data.pokemon_encounters SET owned = 0 WHERE id = ?;";
	    let update_values = [result[i].id]
			async_query(insert_query, insert_vals)
			async_query(update_query, update_values);
    } else {
			let update_query = "UPDATE data.pokemon_encounters SET level = ?, experience = ? WHERE id = ?;";
	    let update_values = [new_level, new_exp, result[i].id]
			async_query(update_query, update_values);
		}
	}
}

async function pballs() {
	let query = 'SELECT * FROM data.pokemon_trainers;';
	let result = await async_query(query, []);
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1; // 0-indexed
  if (day == 1 && month != result[0].ballRefreshMonth) {
    console.log("Time to refresh balls!")
    let update_query = `
    UPDATE data.pokemon_trainers SET
      pokeballs = GREATEST(20, pokeballs),
      greatballs = GREATEST(5, greatballs),
      ultraballs = GREATEST(2, ultraballs),
      omegaballs = GREATEST(0, omegaballs),
      ballRefreshMonth = ?;
    `;
    async_query(update_query, [month]);
  }
}

module.exports = {
  pballs,
  plevels
}

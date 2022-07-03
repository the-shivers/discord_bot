"use strict";

// Constants
const { async_query } = require('../../db/scripts/db_funcs.js')

async function plevels() {
	console.log('Running plevels!')
	let query = 'SELECT pe.*, p.evIds, p.evLevel FROM data.pokemon_encounters AS pe LEFT JOIN data.pokedex AS p ON pe.pokemonId = p.pokemonId WHERE pe.owned = 1 AND pe.level < 100;';
	let result = await async_query(query, []);
  let dex_query = 'SELECT * FROM data.pokedex ORDER BY pokemonId ASC;';
  let dex = await async_query(dex_query, []);
	for (let i = 0; i < result.length; i++) {
		// if (result[i].userId != 790037139546570802) {continue}
    let new_level = result[i].level;
    let increment = 1/144;
		increment *= 3 * Math.exp(-0.0168 * result[i].level)
		let new_exp = result[i].experience + increment;
    if (new_exp > 1) {
      new_level += 1;
      new_exp = 0;
    }
    // Evolution logic
    let new_id = result[i].pokemonId;
    let new_name = result[i].name;
    if (result[i].evIds.length > 0 && new_level >= result[i].evLevel && result[i].canEvolve == 1) {
			console.log("EVOLUTION ALERT vvv\n", result[i])
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
			await async_query(insert_query, insert_vals)
			await async_query(update_query, update_values);
    } else {
			let update_query = "UPDATE data.pokemon_encounters SET level = ?, experience = ? WHERE id = ?;";
	    let update_values = [new_level, new_exp, result[i].id]
			await async_query(update_query, update_values);
		}
	}
}

async function pballs() {
	let query = 'SELECT * FROM data.pokemon_trainers;';
	let result = await async_query(query, []);
	let week_result = await async_query('SELECT WEEK(CURDATE()) AS week;', [])
  if (result[0].ballRefreshWeek != week_result[0].week) {
    console.log("Time to refresh balls!")
    let update_query = `
    UPDATE data.pokemon_trainers SET
      pokeballs = LEAST(pokeballs + 8, 12),
      ballRefreshWeek = ?;
    `;
    async_query(update_query, [week_result[0].week]);
  } else {
		console.log("It's not time to refresh balls yet.")
	}
}

module.exports = {
  pballs,
  plevels
}

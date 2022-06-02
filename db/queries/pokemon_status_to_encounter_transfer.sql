INSERT INTO data.pokemon_encounters (userId, pokemonId, name, nick, level, gender, pokemonChar1, pokemonChar2, isShiny, shinyShift, attempted, caught, owned, captureDifficulty, slot, epoch)
SELECT
  userId,
  pokemonId,
  name,
  nick,
  DATEDIFF(CURDATE(), date),
  gender,
  pokemonChar1,
  pokemonChar2,
  isShiny,
  shinyShift,
  '',
  owned,
  owned,
  captureDifficulty,
  CEIL(RAND() * 1000000),
  epoch
FROM data.pokemon_status;

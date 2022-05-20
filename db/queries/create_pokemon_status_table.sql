CREATE TABLE IF NOT EXISTS data.pokemon_status (
  userId VARCHAR(32) NOT NULL,
  date DATE NOT NULL,
  captureDifficulty TINYINT NOT NULL,
  pokemonId SMALLINT NOT NULL,
  name VARCHAR(32) NOT NULL,
  pokemonChar1 VARCHAR(32) NOT NULL,
  pokemonChar2 VARCHAR(32) NOT NULL,
  isShiny BOOLEAN NOT NULL,
  shinyShift SMALLINT NOT NULL,
  gender VARCHAR(32) NOT NULL,
  owned BOOLEAN NOT NULL,
  slot TINYINT NOT NULL,
  nick VARCHAR(32) NOT NULL,
  pokeballs SMALLINT NOT NULL,
  greatballs SMALLINT NOT NULL,
  ultraballs SMALLINT NOT NULL,
  epoch BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS data.pokemon_trainers (
  userId VARCHAR(32) NOT NULL,
  cash MEDIUMINT NOT NULL DEFAULT 0,
  pokeballs SMALLINT NOT NULL,
  greatballs SMALLINT NOT NULL,
  ultraballs SMALLINT NOT NULL,
  omegaballs SMALLINT NOT NULL,
  ballRefreshMonth TINYINT NOT NULL DEFAULT 5,
  trainStreak SMALLINT NOT NULL DEFAULT 0,
  lastTrainEpoch BIGINT NOT NULL DEFAULT 0,
  slots SMALLINT NOT NULL DEFAULT 6,
  rareChances SMALLINT NOT NULL DEFAULT 0,
  pingable BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (userId)
);
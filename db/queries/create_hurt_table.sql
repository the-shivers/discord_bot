CREATE TABLE IF NOT EXISTS data.hurt (
  userId VARCHAR(32) NOT NULL,
  username VARCHAR(64) NOT NULL,
  isAlive BOOLEAN NOT NULL,
  diedAtEpoch BIGINT NOT NULL,
  lastAttackEpoch BIGINT NOT NULL,
  health TINYINT NOT NULL,
  kills SMALLINT NOT NULL,
  deaths SMALLINT NOT NULL,
  weakened BOOLEAN NOT NULL,
  PRIMARY KEY ( userId )
);

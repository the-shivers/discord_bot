CREATE TABLE IF NOT EXISTS data.setloc (
  userId VARCHAR(32) NOT NULL,
  username VARCHAR(64) NOT NULL,
  locString VARCHAR(128) NOT NULL,
  PRIMARY KEY ( userId )
);

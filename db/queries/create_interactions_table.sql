CREATE TABLE IF NOT EXISTS data.interactions (
  id CHAR(18) NOT NULL,
  guildId CHAR(18) NOT NULL,
  channelId CHAR(18) NOT NULL,
  userId CHAR(18) NOT NULL,
  command VARCHAR(33) NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY ( id )
);

CREATE TABLE IF NOT EXISTS data.messages (
  id CHAR(18) NOT NULL,
  guildId CHAR(18) NOT NULL,
  channelId CHAR(18) NOT NULL,
  userId CHAR(18) NOT NULL,
  content VARCHAR(2000) NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY ( id )
);

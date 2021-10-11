CREATE TABLE IF NOT EXISTS data.wwtbam_status (
  channelId CHAR(32) NOT NULL,
  guildId CHAR(32) NOT NULL,
  userId CHAR(32) NOT NULL,
  status TINYINT NOT NULL,
  question_num TINYINT NOT NULL,
  is_available_50_50 TINYINT NOT NULL,
  is_available_audience TINYINT NOT NULL,
  is_available_friend TINYINT NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY ( channelId )
);

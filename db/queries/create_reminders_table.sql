CREATE TABLE IF NOT EXISTS data.reminders (
   id BIGINT NOT NULL AUTO_INCREMENT,
   userId VARCHAR(32) NOT NULL,
   channelId VARCHAR(32) NOT NULL,
   message TEXT NOT NULL,
   responded BOOL NOT NULL,
   epoch BIGINT NOT NULL,
   PRIMARY KEY (id)
);

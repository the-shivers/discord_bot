CREATE TABLE IF NOT EXISTS data.interaction_options (
  id CHAR(22) NOT NULL,
  interaction_id CHAR(18) NOT NULL,
  name VARCHAR(33) NOT NULL,
  type VARCHAR(20) NOT NULL,
  value VARCHAR(4000) NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY ( id )
);
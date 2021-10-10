var mysql = require('mysql2');
const auth = require("./config.json");

var con = mysql.createConnection(auth.db_connection);

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
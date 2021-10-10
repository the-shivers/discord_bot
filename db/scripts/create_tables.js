var mysql = require('mysql2');
const fs = require('fs');
const auth = require("../../config.json");

// Constants
const queries_dir = '../queries/';

// Collect events
const table_creation_filename_arr = fs.readdirSync(queries_dir).filter(
  file => file.startsWith('create_') && file.endsWith('table.sql')
);

// Establish Connection
var con = mysql.createConnection(auth.db_connection);

// Run Queries
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  for (let i = 0; i < table_creation_filename_arr.length; i++) {
    let query_name = table_creation_filename_arr[i];
    let query = fs.readFileSync(queries_dir + query_name, 'utf-8')
    console.log(query_name);
    console.log(query);
    con.query(query, function (err, result) {
      if (err) throw err;
      console.log("Table created based on " + query_name + ".");
    });
  }
});

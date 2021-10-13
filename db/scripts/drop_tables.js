var mysql = require('mysql2');
const fs = require('fs');
const auth = require("../../config.json");

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Constants
const queries_dir = '../queries/';
db = 'data';

// Get table names
const table_creation_filename_arr = fs.readdirSync(queries_dir).filter(
  file => file.startsWith('create_') && file.endsWith('table.sql')
);

// Establish Connection
var con = mysql.createConnection(auth.db_connection);

// Run Queries
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  readline.question('Do you really want to drop all tables? "YES" to confirm.\n', response => {
    if (response === 'YES') {
      for (let i = 0; i < table_creation_filename_arr.length; i++) {
        let table_name = table_creation_filename_arr[i].replace('create_', '').replace('_table.sql', '');
        let query = "DROP TABLE IF EXISTS " + db + "." + table_name + ";";
        console.log(table_name);
        console.log(query);
        con.query(query, function (err, result) {
          if (err) throw err;
          console.log(table_name + " dropped.");
        });
      }
    } else {
      console.log("Maybe for the best.");
    }
    readline.close();
  });
});
 

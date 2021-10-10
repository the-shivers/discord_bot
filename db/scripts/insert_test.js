var mysql = require('mysql2');
const auth = require("../../config.json");

// Establish Connection
var con = mysql.createConnection(auth.db_connection);

let query_sta = "INSERT INTO data.interactions VALUES (";
let query_end = ");";
let query_data = con.escape(
  "'123456789123456789', '123456789123456789', '123456789123456789', '123456789123456789', '/banana', '2021-10-10T00:58:15.067Z'"
)
let query = query_sta + query_data + query_end;
console.log(query)

// Run Queries
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query(query, function (err, result) {
    if (err) throw err;
    console.log("Data inserted.");
  });
}
});

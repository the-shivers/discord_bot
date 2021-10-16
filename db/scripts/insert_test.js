var mysql = require('mysql2');
const auth = require("../../config.json");

// Establish Connection
var con = mysql.createConnection(auth.db_connection);

let query_sta = "INSERT INTO data.wwtbam_status (channelId, guildId, userId, status, question_num, is_available_50_50, is_available_audience, is_available_friend, updatedAt) VALUES ";
let query_end = ";";
let raw_query_data_arr = [['888888888', '888888', '7900371388888802', 0, 0, 1, 1, 1, '2021-10-10 00:58:15.067']];
let query_data_arr = con.escape(raw_query_data_arr)
let query = query_sta + query_data_arr + query_end;

console.log(query)

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  console.log(query)
  con.query(query, function (err, result) {
    if (err) throw err;
    console.log("Data inserted.");
  });
});

var mysql = require('mysql2');
const auth = require("../../config.json");

// Establish Connection
var con = mysql.createConnection(auth.db_connection);

let query_sta = "INSERT INTO data.interactions (id, guildId, channelId, userId, command, createdAt) VALUES ";
let query_end = ";";
let raw_query_data_arr = [['id3458789123456780', 'guild6789123456789', 'channel89123456789', 'user56789123456789', '/banana', '2021-10-10 00:58:15.067'],['id3456789183456789', 'guild6789123456789', 'channel89123456789', 'user56789123456786', '/banana', '2021-10-10 00:58:15.067']];
//let raw_query_data_arr = ['id3456789123456780', 'guild6789123456789', 'channel89123456789', 'user56789123456789', '/banana', '2021-10-10 00:58:15.067'];
let query_data_arr = con.escape(raw_query_data_arr)
let query = query_sta + query_data_arr + query_end;

console.log(query)

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query(query, function (err, result) {
    if (err) throw err;
    console.log("Data inserted.");
  });
});


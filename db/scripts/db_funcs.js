"use strict";

const auth = require("../../config.json");
var mysql = require('promise-mysql');

// async function async_query(query, values) {
//   let con = await mysql.createConnection(auth.db_connection);
//   return await con.query(query, values);
// }

async function async_query(query, values) {
  let con = await mysql.createConnection(auth.db_connection);
  let result = await con.query(query, values);
  con.end();
  return result;
}

module.exports = {
	async_query
};

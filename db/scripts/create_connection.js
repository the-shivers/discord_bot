var mysql = require('promise-mysql');
const auth = require("../../config.json");

async function run_query(str) {
  let con = await mysql.createConnection(auth.db_connection);
  let res = await con.query('select * from data.wwtbam_status;');
  console.log(res);
}
async function run_query2(str) {
  let con = await mysql.createConnection(auth.db_connection);
  con.query('select * from data.wwtbam_status;')
    .then( result => {
      console.log(result)
    });
}

run_query('a')
run_query2('b')

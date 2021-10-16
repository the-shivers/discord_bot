var mysql = require('mysql2');
const auth = require("./config.json");

// Establish Connection
var con = mysql.createConnection(auth.db_connection);

// Functions
function clean_createdAt(date_obj) {
	return date_obj.toISOString().slice(0, 19).replace('T', ' ');
}

function process_interaction(interaction) {
	return [
    interaction.id, interaction.guildId, interaction.channelId,
    interaction.user.id, interaction.commandId, interaction.commandName,
    clean_createdAt(interaction.createdAt)
  ];
}

function process_interaction_options(interaction) {
	let all_data = [];
	for (let i = 0; i < interaction.options.data.length; i++) {
    all_data.push([
      interaction.id, interaction.options.data[i].name,
      interaction.options.data[i].type, interaction.options.data[i].value,
      clean_createdAt(interaction.createdAt)
    ]);
	}
	return all_data;
}

function process_message(msg) {
	return [
    msg.id, msg.guildId, msg.channelId, msg.author.id,
    msg.content, clean_createdAt(msg.createdAt)
  ];
}

function upload_data(int_arr, int_o_arr, msg_arr) {
	let queries = [];
  if (int_arr.length > 0) {
    queries.push("INSERT INTO data.interactions VALUES " + con.escape(int_arr) + ';');
  }
	if (int_o_arr.length > 0) {
    queries.push("INSERT INTO data.interaction_options VALUES " + con.escape(int_o_arr) + ';');
  }
	if (msg_arr.length > 0) {
    queries.push("INSERT INTO data.messages VALUES " + con.escape(msg_arr) + ';');
  }
	for (let i = 0; i < queries.length; i++) {
		con.connect(function(err) {
		  if (err) throw err;
		  con.query(queries[i], function (err, result) {
		    if (err) throw err;
		  });
		});
	}
}

module.exports = {
	process_interaction,
	process_interaction_options,
	process_message,
	upload_data
};

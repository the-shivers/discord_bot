var mysql = require('mysql2');
const auth = require("../../config.json");

// Establish Connection
var con = mysql.createConnection(auth.db_connection);

// Functions
function clean_createdAt(date_obj) {
	return date_obj.toISOString().slice(0, 19).replace('T', ' ');
}

function process_interaction(interaction) {
	let row_data = [interaction.commandId];
	row_data.push(interaction.guildId);
	row_data.push(interaction.channelId);
	row_data.push(interaction.user.id);
	row_data.push(interaction.commandName);
	row_data.push(clean_createdAt(interaction.createdAt));
	return row_data;
}

function process_interaction_options(interaction) {
	let all_data = [];
	for (let i = 0; i < interaction.options.data.length; i++) {
		let row_data = [interaction.commandId + '_' + i]
		row_data.push(interaction.commandId);
		row_data.push(interaction.options.data[i].name);
		row_data.push(interaction.options.data[i].type);
		row_data.push(interaction.options.data[i].value);
		row_data.push(clean_createdAt(interaction.createdAt));
		all_data.push(row_data);
	}
	return all_data;
}

function process_message(msg) {
	row_data = [msg.id];
	row_data.push(msg.guildId);
	row_data.push(msg.channelId);
	row_data.push(msg.author.id);
	row_data.push(msg.content);
	row_data.push(clean_createdAt(msg.createdAt));
	return row_data;
}

function upload_data(int_arr, int_o_arr, msg_arr) {
	let queries = [];
	queries.push("INSERT INTO data.interactions VALUES ");
	queries[0] += con.escape(int_arr) + ';'
	queries.push("INSERT INTO data.interaction_options VALUES ");
	queries[1] += con.escape(int_o_arr) + ';'
	queries.push("INSERT INTO data.messages VALUES ");
	queries[2] += con.escape(msg_query) + ';'
	for (let i = 0; i < queries.length; i++) {
		console.log("Here is query number " + i + ":\n" + queries[i])
		con.connect(function(err) {
		  if (err) throw err;
		  con.query(query, function (err, result) {
		    if (err) throw err;
		    console.log("Data inserted." + i);
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

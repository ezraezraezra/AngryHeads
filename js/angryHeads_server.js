/**
 * @author Ezra Velazquez
 */

var io = require('socket.io').listen(8005);
var player_count = 0;

var current_level = 1;
var current_tries = 0;
var enemyLevels = new Array();

var players = new Array();
var current_player_index = 0;

var elevel = function(_level, _x, _y, _amount, _status) {
	var level = _level;
	var x_pos = _x;
	var y_pos = _y;
	var amount = _amount;
	var e_status = _status;
	
	return {
		getLevel : function() {
			return level;
		},
		getX : function() {
			return x_pos;
		},
		getY : function() {
			return y_pos;
		},
		getAmount : function() {
			return amount;
		},
		getStatus : function() {
			return e_status;
		},
		getAll : function() {
			var all = {level : level, x_pos : x_pos, y_pos : y_pos, amount : amount, status : e_status};
			return all;
		},
		setStatus : function(_index, _status) {
			e_status[_index] = _status;
		}
	
	}
}

function randomGenerator(from, to) {
	return Math.floor(Math.random() * (to - from + 1) + from);
}

function generateLevel() {
	if(player_count === 0) {
		for(var _x = 0; _x < 5; _x++) {
			var temp_amount = _x + 4;
			var enemy_x = new Array();
			var enemy_y = new Array();
			var enemy_status = new Array();
			
			for( var _y = 0; _y < temp_amount; _y++) {
				enemy_x.push(randomGenerator(400, 1000));
				enemy_y.push(randomGenerator(100, 450));
				enemy_status.push(1);
			}
			
			var temp_level = new elevel(_x, enemy_x, enemy_y, temp_amount, enemy_status);
			
			enemyLevels.push(temp_level.getAll());
		}
	}
	return enemyLevels;
}

io.sockets.on('connection', function (socket) {
	
	var stats = generateLevel();
	player_count += 1;
	console.log("Someone connected, player count: "+ player_count);
//	console.log(enemyLevels[current_level - 1].status[0]);
	
	
	socket.emit('start', {message: "200: Player connected", level_stats: stats, current_level : current_level, current_tries : current_tries, player_count : player_count, current_player_index : current_player_index, players : players});
	
	socket.on('player_move', function(data) {
		console.log("MOVE RECEIVED: "+ data);
		//console.log(data);
		socket.emit('trajectory', { data_echo : data});
		socket.broadcast.emit('trajectory', { data_echo: data});
	});
	
	socket.on('player_remove', function(data) {
		console.log("REMOVE PLAYER");
		console.log("Removing player: "+ data.player_id);
		player_count -= 1;
		if(player_count === 0) {
			console.log("DEEP CLEAN");
			current_level = 1;
			current_tries = 0;
			enemyLevels = new Array();
			player_count = 0;
			players = new Array();
		}
		else {
			for(var x = 0; x < players.length; x++) {
				if(players[x].toString().indexOf(data.player_id.toString()) != -1) {
					players.splice(x,1);
					console.log("In if statment, removing from players array");
				}
			}
			console.log("player removed from array");
			socket.emit('new_player', { new_player : players});
			socket.broadcast.emit('new_player', { new_player: players});
		}
	});
	
	socket.on('level_update', function(data) {
		console.log("LEVEL UPDATE");
		current_level = parseInt(data.level_update, 10);
	});
	
	socket.on('enemy_status', function(data) {
		// TODO
		// Update enemy count
		current_level = data.level;
		current_tries = data.tries;
//		for(var x = 0; x < data.status.length; x++) {
//			enemyLevels[current_level - 1].setStatus(x, data.status[x]);
//		}
//		console.log(enemyLevels[current_level - 1].getStatus());
//		enemyLevels[current_level - 1];
		for(var x = 0; x < data.status.length; x++) {
			enemyLevels[current_level - 1].status[x] = data.status[x];
		}
	});
	
	socket.on('player_id', function(data) {
		// TODO
		// Server keep track of who is playing & who's turn
		// Currently being kept on client, move to here
		players.push(data.player_id);
		console.log('player added to array');
		socket.emit('new_player', { new_player : players});
		socket.broadcast.emit('new_player', { new_player: players});
	});
	
	socket.on('plaer_next', function(data) {
		current_player = data.index_player;
		console.log("Current player index: "+current_player);
	});
	
});

/**
 * @author Ezra Velazquez
 */

var io = require('socket.io').listen(8005);
var player_count = 0;

var current_level = 1;
var enemyLevels = new Array();
//var enemy_amount = current_level + 4;
//var enemy_x = new Array();
//var enemy_y = new Array();


var elevel = function(_level, _x, _y, _amount) {
	var level = _level;
	var x_pos = _x;
	var y_pos = _y;
	var amount = _amount;
	
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
		getAll : function() {
			var all = {level : level, x_pos : x_pos, y_pos : y_pos, amount : amount};
			return all;
		}
	
	}
}

function randomGenerator(from, to) {
	return Math.floor(Math.random() * (to - from + 1) + from);
}

function generateLevel() {
	//var x_pos = new Array();
	//var y_pos = new Array();
	
	if(player_count === 0) {
//		for(var _x = 0; _x < enemy_amount ; _x++) {
//			enemy_x.push(randomGenerator(400, 1000));
//			enemy_y.push(randomGenerator(100, 450));
//		}
		for(var _x = 0; _x < 10; _x++) {
			var temp_amount = _x + 4;
			var enemy_x = new Array();
			var enemy_y = new Array();
			
			for( var _y = 0; _y < temp_amount; _y++) {
				enemy_x.push(randomGenerator(400, 1000));
				enemy_y.push(randomGenerator(100, 450));
			}
			
			var temp_level = new elevel(_x, enemy_x, enemy_y, temp_amount);
			
			enemyLevels.push(temp_level.getAll());
		}
	}
	
	//var _amount = current_level + 4;
	
	//var return_array = {level: current_level, pos_x : enemy_x, pos_y: enemy_y, amount : enemy_amount};
	
	//return return_array;
	return enemyLevels;
}

io.sockets.on('connection', function (socket) {
	
	console.log("Someone connected, player count: "+ player_count);
	
	var stats = generateLevel();
	player_count += 1;
	
	
	socket.emit('start', {message: "200: Player connected", level_stats: stats});
	
	socket.on('player_move', function(data) {
		console.log("MOVE RECEIVED: "+ data);
		//console.log(data);
		socket.emit('trajectory', { data_echo : data});
		socket.broadcast.emit('trajectory', { data_echo: data});
	});
	
	socket.on('player_remove', function() {
		console.log("REMOVE PLAYER");
		player_count -= 1;
		if(player_count === 0) {
			current_level = 0;
		}
	});	
});

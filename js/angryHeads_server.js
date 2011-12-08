/**
 * @author Ezra Velazquez
 */

var io = require('socket.io').listen(8005);
var host_id = "";

io.sockets.on('connection', function (socket) {
	console.log("Someone connected");
	
	socket.emit('start', {message: "connected to server"});
	
	socket.on('player_move', function(data) {
		console.log("MOVE RECEIVED");
		//console.log(data);
		socket.emit('trajectory', { data_echo : data});
		socket.broadcast.emit('trajectory', { data_echo: data});
	});
	
});

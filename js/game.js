/*
 * Project:     AngryHeads
 * Description: Proof-of-concept on the idea of TokBox's
 *              OpenTok API mashed with the game
 *              mechanics of Angry Birds          
 * Website:     http://ezraezraezra.com/tb/AngryHeads
 * 
 * Author:      Ezra Velazquez
 * Website:     http://ezraezraezra.com
 * Date:        November 2011
 * 
 */
//var socket;
//var player_count;

var game_var;

$(document).ready(function() {
	game_var = new GAME();
});

var GAME = function() {
	var socket;
	var player_count;
	// jQuery DOM objects
	// Set only once to easily track & modify if needed
	var $DOM = {
		volume : $("#volume"),
		volume_on : $("#volume_on"),
		volume_off : $("#volume_off"),
		module_button_close : $("#module_button_close"),
		module_camera : $("#module_camera"),
		modal_cover : $("#modal_cover"),
		main_title : $("#main_title"),
		container_game : $("#container_game"),
		missle : $("#missle")
	};
	var audio = {
		gasps : new Audio("assets/gasps6.mp3"),
		sling_pull : new Audio("assets/sling_pull.mp3"),
		sling_release : new Audio("assets/sling_release.mp3"),
		background : new Audio("assets/house_made-mike_vekris.mp3")
	}
	var isPressed = false;
	var BOUNCES_ALLOWED = 0;
	var launch_missle = false;
	var trajectory_results;
	var missleStart = {
		x : 0,
		y : 0
	};
	var sling_pull_counter = 0;
	var ground_hit = new Array();
	
	for(var x = 0; x < 6; x++) {
		ground_hit[x] = new Audio("assets/node_hit.mp3");
	}
	
	startSocketListeners();
	startEventListeners();
	startMusic();
	
	function startMusic() {
		setTimeout(function() {
			audio.background.play();
			audio.background.volume = .5;
		}, 2000);
	}
	
	function startSocketListeners() {
		socket = io.connect('http://localhost:8005');
			
		socket.on('start', function (data) {
			player_count = parseInt(data.player_count, 10);
			index_player = parseInt(data.current_player_index, 10);
			
			players = data.players;
			GAME_CANVAS.constructEnemy(data);
		});
		
		socket.on('trajectory', function (data) {
			if(my_streamId != parseInt(data.data_echo.player_id, 10)) {
				audio.sling_release.play();
				audio.gasps.play();
				sling_pull_counter += 1;
				
				missleStart.y = data.data_echo.start_y;
				missleStart.x = data.data_echo.start_x;
				trajectory_results = trajectory.calculate(data.data_echo.sling_x, data.data_echo.sling_y, missleStart.x, missleStart.y);
				moveMissle(0,0, "left");
			}
		});
		
		socket.on('new_player', function (data) {
			players = data.new_player;
		});
	}
	
	function startEventListeners() {
		audio.background.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
		
		// Volume Listener
		$DOM.volume.click(function() {
			if($DOM.volume_on.css("display") == 'block') {
				audio.background.volume = 0;
				$DOM.volume_on.css("display", "none");
				$DOM.volume_off.css("display", "block");
			}
			else {
				audio.background.volume = .5;
				$DOM.volume_on.css("display", "block");
				$DOM.volume_off.css("display", "none");
			}
		});
		
		// Modal Close Listener
		$DOM.module_button_close.click(function() {
			$DOM.module_camera.animate({"top" :  "-500px"}, "slow");
			$DOM.modal_cover.fadeOut("slow");
			$DOM.main_title.fadeIn("slow");
		});
		
		// Mouse Listener
		$DOM.container_game.mousemove(function(mousePosition) {
			if(my_streamId == players[index_player]) {
				$DOM.missle.mousedown(function() {
					isPressed = true;	
				});
				$DOM.container_game.mouseup(function() {
					isPressed = false;
				});
				$DOM.missle.mouseup(function() {
					launch_missle = true;
				});
				
				if(isPressed === true) {
					// Player clicks on the missle
					if(mousePosition.pageX > 38 && mousePosition.pageX < 160 && mousePosition.pageY < 470 && mousePosition.pageY > 326) {
						if(sling_pull_counter === 0) {
							audio.sling_pull.play();
							sling_pull_counter += 1;
						}
						$DOM.missle.css("top", mousePosition.pageY - 37/*125*/);
						$DOM.missle.css("left", mousePosition.pageX - 37/*125*/);
						missleStart.y = mousePosition.pageY - 37/*125*/;
						missleStart.x = mousePosition.pageX - 37/*125*/;
						GAME_CANVAS.updateSling(missleStart.x, missleStart.y);
					}
					else {
						launch_missle = false;
					}
				}
			}
		}).mouseup(function() {
			if(my_streamId == players[index_player]) {
				if(launch_missle === true && isPressed === true) {
					launch_missle = false;
					isPressed = false;
					
					audio.sling_release.play();
					audio.gasps.play();
					sling_pull_counter = 0;
					// Launch object
					trajectory_results = trajectory.calculate(150,363,missleStart.x,missleStart.y);
					
					socket.emit('player_move', {
							sling_x : 150,
							sling_y : 363,
							start_x : missleStart.x,
							start_y : missleStart.y,
							player_id : my_streamId
							});
					
					moveMissle(0,0, "left");
				}
			}
		});	
	}
	
	function moveMissle(numberX, numberY, direction) {
		switch(direction) {
			case "left":
				$DOM.missle.css("left", numberX + missleStart.x);
		 		$DOM.missle.css("top", missleStart.y - trajectory_results[numberX]);
		 		break;
			case "down":
				$DOM.missle.css("top", missleStart.y - trajectory_results[numberX] + numberY);
				break;
			default:
				// Do nothing
		}
		
		// update sling
		if(numberX+missleStart.x < 120) {
			GAME_CANVAS.updateSling(numberX+missleStart.x, missleStart.y - trajectory_results[numberX]);
		}
		else {
			GAME_CANVAS.staticSling();
		}
		
		//update enemies
		GAME_CANVAS.updateEnemy(numberX+missleStart.x, missleStart.y - trajectory_results[numberX]);
		
		if(numberX < trajectory_results.length - 1) {
			// If I can still move left
			if( (((missleStart.y - trajectory_results[numberX]) + 75) < 500)  && (numberX + missleStart.x + 75 < $DOM.container_game.width() ) && (BOUNCES_ALLOWED <=5)) {
				missleAction("continue", numberX, numberY);
			}
			// Rebound
			else if ( (numberX + missleStart.x + 75 < $DOM.container_game.width()) && (BOUNCES_ALLOWED <=5) ) {// && missleStart.y <= 376 ) {
				missleAction("rebound", numberX, numberY);
			}
			// If else I can still move down
			else if ( (missleStart.y - trajectory_results[numberX] + numberY + 80/*75*/ < 500) ) {
				missleAction("down", numberX, numberY);
			}
			else {
				stopBounce(true);
			}
		}
		// Stop me
		else {
			stopBounce(false);
		}
	}
	
	function missleAction(direction, numberX, numberY) {
		switch(direction) {
			case "continue":
				numberX += 5;//4;
				GAME_CANVAS.updateEnemyMouth(1);
				var t = setTimeout(function() {moveMissle(numberX,numberY, "left");}, 0.3);
				break;
			case "rebound":
				ground_hit[BOUNCES_ALLOWED].play();
				BOUNCES_ALLOWED += 1;
				var pre_numX = numberX;
				numberX = 0;
				numberY = 0;
				missleStart.x = pre_numX + missleStart.x;
				missleStart.y = 375;
				// Launch object
				trajectory_results = trajectory.recalculate();
				GAME_CANVAS.updateEnemyMouth(1);
				var t = setTimeout(function() {moveMissle(numberX,numberY, "left");}, 0.3);
				break;
			case "down":
				numberY += 3;//2;
				GAME_CANVAS.updateEnemyMouth(1);
				var t = setTimeout(function() {moveMissle(numberX, numberY, "down");}, 0.3);
				break;
			default:
				
		}
	}
	
	function stopBounce(play_ground_hit) {
		BOUNCES_ALLOWED = 0;
		$DOM.missle.css("top", 425);
		GAME_CANVAS.updateEnemyMouth(0);
		
		if(play_ground_hit === true) {
			ground_hit[0].play();
		}
		
		socket.emit('enemy_status', {
			level : GAME_CANVAS.getLevel(),
			tries : GAME_CANVAS.getTries(),
			status : GAME_CANVAS.getStatus()
		});
		
		clearTimeout(t);
		var t = setTimeout(function() {resetSling();}, 1500);
	}
	
	function resetSling() {
		$DOM.missle.css({top : 325, left: 120});
		switchVideoFeed();
		GAME_CANVAS.updateScore();
	}
	
	return {
		socketValue : function() {
			return socket;
		},
		getPlayerCount : function() {
			return player_count;
		},
		increasePlayerCount : function(increase_amount) {
			player_count += increase_amount;
		}
	}
}

$(window).bind('beforeunload', function() {
	game_var.socketValue().emit('player_remove', {
		action : 'remove',
		player_id : my_streamId
	});
			
});
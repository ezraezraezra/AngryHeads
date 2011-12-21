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
var socket;
var background_music = new Audio("assets/house_made-mike_vekris.mp3");

$(document).ready(function() {
	var isPressed = false;
	var BOUNCES_ALLOWED = 0;
	var launch_missle = false;
	var trajectory_results;
	var missleStart = {
		x : 0,
		y : 0
	};
	var gasps_audio = new Audio("assets/gasps6.mp3");
	var sling_pull = new Audio("assets/sling_pull.mp3");
	var sling_release = new Audio("assets/sling_release.mp3");
	//var background_music = new Audio("assets/house_made-mike_vekris.mp3");
	//http://subs.freesoundtrackmusic.com/freemusic?TRACKLISTINGGET|NEWEST|THEMES|BLANK|0|TRACKLISTING|KEYWORD|whimsical|NOT%20USED|NOT%20USED|NOT%20USED
	
	var sling_pull_counter = 0;
	var ground_hit = new Array();
	
	for(var x = 0; x < 6; x++) {
		ground_hit[x] = new Audio("assets/node_hit.mp3");
	}
	
	socket = io.connect('http://localhost:8005');
			socket.on('start', function (data) {
				console.log(data);
				GAME_CANVAS.constructEnemy(data);
			});
			
			socket.on('trajectory', function (data) {
				console.log(data);
				console.log("Received trajectory from server");
				if(my_streamId != parseInt(data.data_echo.player_id, 10)) {
					sling_release.play();
					gasps_audio.play();
					sling_pull_counter += 1;
					
					missleStart.y = data.data_echo.start_y;
					missleStart.x = data.data_echo.start_x;
					trajectory_results = trajectory.calculate(data.data_echo.sling_x, data.data_echo.sling_y, missleStart.x, missleStart.y);
					moveMissle(0,0, "left");
				}
			});
	
	background_music.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
	
	setTimeout(function() {
		console.log("start music");
		background_music.play();
		background_music.volume = .5;
	}, 2000);
	
	
	
	$("#module_button_close").click(function() {
		$("#module_camera").animate({"top" :  "-500px"}, "slow");
		$("#modal_cover").fadeOut("slow");
		$("#main_title").fadeIn("slow");
	});
	
	$("#container_game").mousemove(function(mousePosition) {
		if(my_streamId == players[index_player]) {
		
			$("#missle").mousedown(function() {
				isPressed = true;
				
			});
			$("#container_game").mouseup(function() {
				isPressed = false;
			});
			$("#missle").mouseup(function() {
				launch_missle = true;
			});
			
			if(isPressed === true) {
				if(mousePosition.pageY > 326 && mousePosition.pageX < 160) {
					if(sling_pull_counter === 0) {
						sling_pull.play();
						sling_pull_counter += 1;
					}
					$("#missle").css("top", mousePosition.pageY - 37/*125*/);
					$("#missle").css("left", mousePosition.pageX - 37/*125*/);
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
				
				sling_release.play();
				gasps_audio.play();
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
	
	function moveMissle(numberX, numberY, direction) {
		switch(direction) {
			case "left":
				$("#missle").css("left", numberX + missleStart.x);
		 		$("#missle").css("top", missleStart.y - trajectory_results[numberX]);
		 		console.log("Left called");
				break;
			case "down":
				$("#missle").css("top", missleStart.y - trajectory_results[numberX] + numberY);
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
			if( (((missleStart.y - trajectory_results[numberX]) + 75) < 500)  && (numberX + missleStart.x + 75 < $("#container_game").width() ) && (BOUNCES_ALLOWED <=5)) {

				numberX += 5;//4;
				GAME_CANVAS.updateEnemyMouth(1);
				var t = setTimeout(function() {moveMissle(numberX,numberY, "left");}, 0.3);
			}
			else if ( (numberX + missleStart.x + 75 < $("#container_game").width()) && (BOUNCES_ALLOWED <=5) ) {// && missleStart.y <= 376 ) {
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
			}
			// If else I can still move down
			else if ( (missleStart.y - trajectory_results[numberX] + numberY + 80/*75*/ < 500) ) {
				console.log('down');
				console.log(numberY);
				numberY += 3;//2;
				GAME_CANVAS.updateEnemyMouth(1);
				var t = setTimeout(function() {moveMissle(numberX, numberY, "down");}, 0.3);
			}
			else {
				console.log('reset');
				BOUNCES_ALLOWED = 0;
				ground_hit[0].play();
				$("#missle").css("top", 425);
				GAME_CANVAS.updateEnemyMouth(0);
				
				var temp_level = GAME_CANVAS.getLevel();
				var temp_tries = GAME_CANVAS.getTries();
				var temp_status = GAME_CANVAS.getStatus();
				socket.emit('enemy_status', {
					level : temp_level,
					tries : temp_tries,
					status : temp_status
				});
				
				
				clearTimeout(t);
				var t = setTimeout(function() {resetSling();}, 1500);
			}
		
		
		// Stop me
		}
		else {
			console.log("Outside");
			BOUNCES_ALLOWED = 0;
			//ground_hit[0].play();
			$("#missle").css("top", 425);
			GAME_CANVAS.updateEnemyMouth(0);
			
			var temp_level = GAME_CANVAS.getLevel();
			var temp_tries = GAME_CANVAS.getTries();
			var temp_status = GAME_CANVAS.getStatus();
			socket.emit('enemy_status', {
				level : temp_level,
				tries : temp_tries,
				status : temp_status
			});
			
			
			clearTimeout(t);
			var t = setTimeout(function() {resetSling();}, 1500);
		}
	}
	
	function resetSling() {
		$("#missle").css({top : 325, left: 120});
		
		switchVideoFeed();
		
		
		GAME_CANVAS.updateScore();
	}
});

$(window).bind('beforeunload', function() {
	socket.emit('player_remove', {
		action : 'remove'
	});
			
});
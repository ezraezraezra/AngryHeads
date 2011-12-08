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
	var sling_pull_counter = 0;
	var ground_hit = new Array();
	for(var x = 0; x < 6; x++) {
		ground_hit[x] = new Audio("assets/node_hit.mp3");
	}
	
	var socket = io.connect('http://localhost:8005');
			socket.on('start', function (data) {
				console.log(data);
			});
			
			socket.on('trajectory', function (data) {
				console.log(data);
				console.log("Received trajectory from server");
				if(my_streamId != parseInt(data.data_echo.player_id, 10)) {
					sling_release.play();
					gasps_audio.play();
					sling_pull_counter = 0;
					
					trajectory_results = data.data_echo.results;
					missleStart.y = data.data_echo.start_y;
					missleStart.x = data.data_echo.start_x;
					moveMissle(0,0, "left");
				}
			});
	
	
	$("#module_button_close").click(function() {
		$("#module_camera").animate({"top" :  "-500px"}, "slow");
		$("#modal_cover").fadeOut("slow");
	});
	
	$("#container_game").mousemove(function(mousePosition) {
		//console.log(my_streamId);
		//console.log(players[index_player]);
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
					//isPressed = false;
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
				
				// TODO Tell everyone else to move the object on screen
				socket.emit('player_move', {
						results: trajectory_results,
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
			if( (((missleStart.y - trajectory_results[numberX]) + 75) < 500)  && (numberX + missleStart.x + 75 < $("#container_game").width() )) {
				numberX += 5;//4;
				GAME_CANVAS.updateEnemyMouth(1);
				var t = setTimeout(function() {moveMissle(numberX,numberY, "left");}, 0.3);
			}
			else if ( (numberX + missleStart.x + 75 < $("#container_game").width()) && (BOUNCES_ALLOWED <=5) ) {// && missleStart.y <= 376 ) {
				// restart bounce here
				//console.log(numberY);
				//console.log(trajectory_results[numberX]);
//				console.log("Bounce #: "+BOUNCES_ALLOWED);
//				console.log(missleStart.y - trajectory_results[numberX] + 75);
//				console.log('---');
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
				//moveMissle(missleStart.x,missleStart.y, "left");
//				console.log("here again");
				var t = setTimeout(function() {moveMissle(numberX,numberY, "left");}, 0.3);
				// console.log("missleStart.x: "+missleStart.x);
				// console.log("numberX: "+pre_numX);
				// console.log("Together + 75: "+(pre_numX + missleStart.x + 75));
				// console.log(missleStart.y);
				// console.log(trajectory_results);
				
			}
			// If else I can still move down
			else if ( (missleStart.y - trajectory_results[numberX] + numberY + 75 < 500) ) {
				numberY += 3;//2;
				GAME_CANVAS.updateEnemyMouth(1);
				var t = setTimeout(function() {moveMissle(numberX, numberY, "down");}, 0.3);
			}
			else {
				BOUNCES_ALLOWED = 0;
				ground_hit[0].play();
				$("#missle").css("top", 425);
				GAME_CANVAS.updateEnemyMouth(0);
				clearTimeout(t);
				var t = setTimeout(function() {resetSling();}, 1500);
			}
		
		
		// Stop me
		}
	}
	
	function resetSling() {
		$("#missle").css({top : 325, left: 120});
		
		// TODO Change player on slingshot
		switchVideoFeed();
		
		
		GAME_CANVAS.updateScore();
	}
});
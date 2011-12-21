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

var GAME_CANVAS = function() {
	var c;
	var cxt;
	var slingX = 100;
	var slingY = 310;
	var enemies = new Array();
	var tries = 0;
	var level = 1;
	var level_completed = new Audio("assets/charge1a.mp3");
	var allEnemies;
	
	$(document).ready(function() {
		c = document.getElementById('game_canvas');
		cxt = c.getContext("2d");
		draw();
	});
	
	function loadEnemy() {
		for(var x = 0; x < allEnemies[level - 1].amount; x++) {
			enemies[x] = new ENEMY(allEnemies[level - 1].x_pos[x], allEnemies[level - 1].y_pos[x], "rgba(192,202,85,1)", 0, allEnemies[level - 1].status[x]);
		}
		drawEnemy();
	}
	
	// Function from: http://www.admixweb.com/2010/08/24/javascript-tip-get-a-random-number-between-two-integers/
	function randomGenerator(from, to) {
		return Math.floor(Math.random() * (to - from + 1) + from);
	}
	
	function drawGrid() {
		//Grid
		for(x = 0; x*10 < 900; x++) {
			cxt.beginPath();
			cxt.strokeStyle = "#000000";
			cxt.moveTo(x*10, 0);
			cxt.lineTo(x*10,500);
			cxt.closePath();
			cxt.stroke();
		}
		
		for(y = 0; y*10 < 500; y++) {
			cxt.beginPath();
			cxt.strokeStyle = "#000000";
			cxt.moveTo(0, y*10);
			cxt.lineTo(900, y*10);
			cxt.closePath();
			cxt.stroke();
		}
	}
	
	function drawSlingShot() {
		//slingshot
		cxt.beginPath();
		cxt.fillStyle = "rgba(140,84,48,1)";
					
		cxt.moveTo(slingX,slingY);
		cxt.lineTo(slingX, slingY + 110);
		cxt.lineTo(slingX + 40, slingY + 110);
		cxt.lineTo(slingX + 40, slingY + 190);
		cxt.lineTo(slingX + 70, slingY + 190);
		cxt.lineTo(slingX + 70, slingY + 110);
		cxt.lineTo(slingX + 110, slingY+ 110);
		cxt.lineTo(slingX + 110, slingY);
		cxt.lineTo(slingX + 90, slingY);
		cxt.lineTo(slingX + 90, slingY + 90);
		cxt.lineTo(slingX + 20, slingY + 90);
		cxt.lineTo(slingX + 20, slingY);
					
		cxt.closePath();
		cxt.stroke();
		cxt.fill();
	}
	
	function drawStaticSling() {
		cxt.fillStyle = "orange";
		cxt.fillRect(slingX, slingY + 30, 110, 20);
	}
	
	function drawDynamicSling(mouseX, mouseY) {
		//slingshot bands
		cxt.fillStyle = "orange";
		//static
		cxt.fillRect(slingX, slingY + 30, 20, 20);
		cxt.fillRect(slingX + 90, slingY + 30, 20, 20);
		//dynamic left band
		cxt.beginPath();
		cxt.fillStyle = "orange";
		cxt.moveTo(slingX + 20, slingY + 30);
		cxt.lineTo(mouseX, mouseY+25);
		cxt.lineTo(mouseX, mouseY+50);
		cxt.lineTo(slingX + 20, slingY + 50);
		cxt.closePath();
		cxt.fill();
		//dynamic right band
		cxt.beginPath();
		cxt.fillStyle = "orange";
		cxt.moveTo(slingX + 90, slingY + 30);
		cxt.lineTo(mouseX + 50, mouseY + 35);
		cxt.lineTo(mouseX + 50, mouseY + 60);
		cxt.lineTo(slingX + 90, slingY + 50);
		cxt.closePath();
		cxt.fill();
	}
	
	function draw() {
		drawSlingShot(120,325);
		drawStaticSling();
		drawEnemy();
		drawScore();	
	}
	
	function drawEnemy() {
		for(var x = 0; x < enemies.length; x++) {
			if(enemies[x].getState() != 0) {
				cxt.fillStyle = enemies[x].getColor();
				
				// Body
				cxt.beginPath();
				cxt.arc(enemies[x].getX(), enemies[x].getY(), 25, 0, Math.PI *2, true);
				cxt.closePath();
				cxt.fill();
				
				// Eyes
				cxt.fillStyle = "rgba(86,98,107,1)";
				cxt.beginPath();
				cxt.arc(enemies[x].getX() - 10, enemies[x].getY() - 5, 5, 0, Math.PI *2, true);
				cxt.closePath();
				cxt.fill();
				cxt.beginPath();
				cxt.arc(enemies[x].getX() + 10, enemies[x].getY(), 5, 0, Math.PI *2, true);
				cxt.closePath();
				cxt.fill();
				
				// Mouth
				cxt.fillStyle = "rgba(242,221,182,1)";
				if(enemies[x].getMouth() === 0) {
					cxt.beginPath();
					cxt.fillRect(enemies[x].getX()-12, enemies[x].getY()+9, 20,3);
					cxt.closePath();
				}
				else {
					cxt.beginPath();
					cxt.arc(enemies[x].getX()-2, enemies[x].getY()+12, 8, 0, Math.PI * 2, true);
					cxt.closePath();
					cxt.fill();
				}
			}
		}
	}
	
	function drawScore() {
		cxt.font = "bold 20pt Arial";
		cxt.fillStyle = "rgba(22,22,22,1)";
		cxt.fillText("Tries: "+tries, 950, 40);
		cxt.fillText("Level: "+level, 950, 70);
	}
	
	var ENEMY = function(_x,_y,_color, _mouth, _state) {
		var x = _x;
		var y = _y;
		var color = _color;
		var state = _state;//1;
		var mouth = _mouth;
		var pop = new Audio("assets/softcork.mp3");
		var sound_counter = 0;
		
		return {
			updateState : function(status) {
				if(status === 0) {
					color = color;
					state = state;
				}
				else {
					color = color;
					state = 0;
				}
			},
			getX : function() {
				return x;
			},
			getY : function() {
				return y;
			},
			getColor : function() {
				return color;
			},
			getState : function() {
				return state;
			},
			updateMouth : function(status) {
				mouth = status;
			},
			getMouth : function() {
				return mouth;
			},
			playSound : function() {
				if(sound_counter === 0) {
					pop.play();
					sound_counter += 1;
				}
			},

			reset : function() {
				x = randomGenerator(400, 1000);
				y = randomGenerator(100,450);
				state = 1;
				sound_counter = 0;
			}
		}
	}
	
	
	return {
		updateSling : function(x,y) {
			cxt.clearRect(0,0,1152,500);
			drawSlingShot();
			drawDynamicSling(x,y);
			drawEnemy();
			drawScore();
		},
		staticSling : function() {
			cxt.clearRect(0,0,1152,500);
			drawSlingShot();
			drawStaticSling();
			drawEnemy();
			drawScore();
		},
		updateEnemy : function(missleX,missleY) {
			for(var x = 0; x < enemies.length; x++) {
				if(missleX > enemies[x].getX() + 50 || missleX + 75 < enemies[x].getX() || missleY > enemies[x].getY() + 50 || missleY + 75 < enemies[x].getY()) {
					enemies[x].updateState(0);
				}
				else {
					if(enemies[x].getState() === 0) {
						enemies[x].playSound();
					}
					enemies[x].updateState(1);
				}
			}
		},
		updateScore : function() {
			tries += 1;
			cxt.clearRect(0,0,1152,500);
			
			var game_state = 0;
			for(var x = 0; x < enemies.length; x ++) {
				if(enemies[x].getState() == 0) {
					game_state += 1;
				}
			}
			if(game_state == enemies.length) {
				for(var x = 0; x < enemies.length; x++) {
					enemies[x].reset();
				}
				tries = 0;
				level_completed.play();
				loadEnemy();
				level +=1;
			}
			
			drawSlingShot();
			drawStaticSling();
			drawEnemy();
			drawScore();
			
		},
		updateEnemyMouth : function(isOpen) {
			for(var x = 0; x < enemies.length; x++) {
				enemies[x].updateMouth(isOpen);
			}
		},
		constructEnemy : function(data) {
			level = data.current_level;
			tries = data.current_tries;
			cxt.clearRect(0,0,1152,500);
			drawSlingShot();
			drawStaticSling();
			drawScore();
			allEnemies = data.level_stats;
			loadEnemy();
		},
		updateLevel : function() {
			level += 1;
			loadEnemy();
		},
		getLevel : function() {
			return level;
		},
		getTries : function() {
			return tries + 1;
		},
		getStatus : function() {
			var temp_status = new Array();
			for(var x = 0; x < enemies.length; x++) {
				temp_status.push(enemies[x].getState());
			}
			return temp_status;
		}
	};
}();

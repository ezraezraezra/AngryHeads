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

var trajectory = function(){
	var THETA;
	var SIDEC;
	
	function calculateTrajectory(_theta, _v){
	 	//Formula from: http://answers.yahoo.com/question/index?qid=20070716014740AASLSDS
		var y = []; 		// the y coordinate of the end of the projectile
		var x = 0; 			// the x coordinate of the end of the projectile
		var theta = _theta; // Between 0 - 90, the angle (in radians) of inclination (from the horizontal) of the initial velocity
		var g = 9.81; 		// gravitational constant, 9.81
		var v = _v;//50; 		// Between 0 - 50, initial velocity
		
		var cont = true;
		
		while (cont === true) {
			var temp_y = (x * Math.tan(theta)) - ((g * Math.pow(x, 2)) / (2 * Math.pow(v, 2) * Math.pow(Math.cos(theta), 2)));
			if (temp_y >= -200) {
				y.push(temp_y);
			}
			else {
				cont = false;
			}
			x += 1;
		}
		
		// For debugging purposes
		var final_trajectory = [];
		for (var forCount = 0; forCount < y.length; forCount++) {
			//console.log("x: " + forCount + " , y: " + y[forCount]);
			final_trajectory[forCount] = y[forCount];
		}
		
		return final_trajectory;
	}
	
	function createRightTrianglePoint(pointA, pointB){
		var pointC = new point();
			pointC.x = pointA.x;
			pointC.y = pointB.y;
		return pointC;
	}
			
	function point(){
		var x;
		var y;
	}
			
	function distance(pointA, pointB){
		// From: http://www.purplemath.com/modules/distform.htm
		var pointC = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
		return pointC;
	}
			
	function pythagoreanTheorem(sideA, sideB){
		return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
	}
			
	function cosineRule(a, b, c){
		// From: http://www.mathsisfun.com/algebra/trig-cosine-law.html
		// Returns radian, not degree
		return Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b));
	}
	
	return {
		calculate: function(slingTopX, slingTopY, objectX, objectY){
			// Declare points
			var topPoint = new point();
			//topPoint.x = 50;
			//topPoint.y = 0;
			topPoint.x = slingTopX;
			topPoint.y = slingTopY;
			var bottomPoint = new point();
			//bottomPoint.x = 0;
			//bottomPoint.y = 50;
			bottomPoint.x = objectX;
			bottomPoint.y = objectY;
			var midPoint = createRightTrianglePoint(topPoint, bottomPoint);
			
			
			// Find length of sides
			var sideA = distance(topPoint, midPoint);
			//console.log("sideA length: " + sideA);
			var sideB = distance(bottomPoint, midPoint);
			//console.log("sideB length: " + sideB);
			var sideC = pythagoreanTheorem(sideA, sideB);
			
			// Find angle
			var theta = cosineRule(sideA, sideC, sideB);
			
			// Turn cannon projectile into slingshot projectile
			theta = 180 - 90 - theta;
			
			THETA = theta;
			SIDEC = sideC;
			
			// console.log("midpoint is: ");
			// console.log(midPoint);
			// console.log("length of side c is: ");
			// console.log(sideC);
			 //console.log("radian is: ");
			 //console.log(theta * (180/Math.PI));
			
			return calculateTrajectory(theta, sideC );
		},
		recalculate : function() {
			SIDEC = SIDEC/2;
			//console.log(SIDEC);
			return calculateTrajectory(THETA, SIDEC);
		}
	};
}();		
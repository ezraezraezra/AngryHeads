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

//var apiKey = 7058002; // OpenTok sample API key. Replace with your own API key.
//		var sessionId = '14685d1ac5907f4a2814fed28294d3f797f34955'; // Replace with your session ID.
//		var token = 'devtoken'; // Should not be hard-coded.
								// Add to the page using the OpenTok server-side libraries.
		var session;
		var publisher;
		var subscribers = {};
		var players = new Array();
		var index_player = 0;
		var my_streamId = 0;

		// Un-comment either of the following to set automatic logging and exception handling.
		// See the exceptionHandler() method below.
		// TB.setLogLevel(TB.DEBUG);
		TB.addEventListener("exception", exceptionHandler);

		if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
			alert("You don't have the minimum requirements to run this application."
				  + "Please upgrade to the latest version of Flash.");
		} else {
			session = TB.initSession(sessionId);	// Initialize session

			// Add event listeners to the session
			session.addEventListener('sessionConnected', sessionConnectedHandler);
			session.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
			session.addEventListener('connectionCreated', connectionCreatedHandler);
			session.addEventListener('connectionDestroyed', connectionDestroyedHandler);
			session.addEventListener('streamCreated', streamCreatedHandler);
			session.addEventListener('streamDestroyed', streamDestroyedHandler);
			
			connect();
		}

		//--------------------------------------
		//  LINK CLICK HANDLERS
		//--------------------------------------

		/*
		If testing the app from the desktop, be sure to check the Flash Player Global Security setting
		to allow the page from communicating with SWF content loaded from the web. For more information,
		see http://www.tokbox.com/opentok/build/tutorials/helloworld.html#localTest
		*/
		function connect() {
			session.connect(apiKey, token);
		}

		function disconnect() {
			session.disconnect();
		}

		// Called when user wants to start publishing to the session
		function startPublishing() {
			if (!publisher) {
				var parentDiv = document.getElementById("publisher_camera");
				var publisherDiv = document.createElement('div'); // Create a div for the publisher to replace
				publisherDiv.setAttribute('id', 'opentok_publisher');
				parentDiv.appendChild(publisherDiv);
				publisher = session.publish(publisherDiv.id); // Pass the replacement div id to the publish method
				
				
			}
		}

		function stopPublishing() {
			if (publisher) {
				session.unpublish(publisher);
			}
			publisher = null;
		}

		//--------------------------------------
		//  OPENTOK EVENT HANDLERS
		//--------------------------------------

		function sessionConnectedHandler(event) {
			// Subscribe to all streams currently in the Session
			for (var i = 0; i < event.streams.length; i++) {
				addStream(event.streams[i]);
			}
			startPublishing();
		}

		function streamCreatedHandler(event) {
			// Subscribe to the newly created streams
			for (var i = 0; i < event.streams.length; i++) {
				addStream(event.streams[i]);
			}
		}

		function streamDestroyedHandler(event) {
			// This signals that a stream was destroyed. Any Subscribers will automatically be removed.
			// This default behaviour can be prevented using event.preventDefault()
			console.log("a stream was destroyed");
			console.log(event);
			for(var x = 0; x < players.length; x++) {
				for(var y = 0; y < event.streams.length; y++) {
					if(players[x].toString().indexOf(event.streams[y].streamId.toString()) != -1 ) {
						temp_index = x;
					}
				}
				
				players.splice(x - 1 ,1);
				console.log("This is the updated array");
				console.log(players);		
			}
		}

		function sessionDisconnectedHandler(event) {
			// This signals that the user was disconnected from the Session. Any subscribers and publishers
			// will automatically be removed. This default behaviour can be prevented using event.preventDefault()
			publisher = null;
		}

		function connectionDestroyedHandler(event) {
			// This signals that connections were destroyed
		}

		function connectionCreatedHandler(event) {
			// This signals new connections have been created.
		}

		/*
		If you un-comment the call to TB.addEventListener("exception", exceptionHandler) above, OpenTok calls the
		exceptionHandler() method when exception events occur. You can modify this method to further process exception events.
		If you un-comment the call to TB.setLogLevel(), above, OpenTok automatically displays exception event messages.
		*/
		function exceptionHandler(event) {
			alert("Exception: " + event.code + "::" + event.message);
		}

		//--------------------------------------
		//  HELPER METHODS
		//--------------------------------------

		function addStream(stream) {
			// Check if this is the stream that I am publishing, and if so do not publish.
			if (stream.connection.connectionId == session.connection.connectionId) {
/*
				// Create missle
				var subscriberDiv = document.createElement('div'); // Create a div for the subscriber to replace
				subscriberDiv.setAttribute('id', stream.streamId); // Give the replacement div the id of the stream as its id.
				document.getElementById("missle").appendChild(subscriberDiv);
				
				// Rounded corners
				setTimeout(function() {
					console.log(stream.streamId);
					var curr_id = $("[id^=subscriber_"+ stream.streamId +"]").attr("id");
					document.getElementById(curr_id).style.borderRadius = '75px';
				}, 2000);
				
				var subscriberProps = {width: 75,
									   height: 75,
									   subscribeToAudio: false};
				subscribers[stream.streamId] = session.subscribe(stream, subscriberDiv.id, subscriberProps);
*/				
				my_streamId = stream.streamId;
				// TODO tell server of my ability to play
				// socket.emit('player_id', {
						// player_id : my_streamId
				// });
				
				$("#module_button_close").fadeIn("slow");
				//return;
			}
			// Add player to waiting cue
			var subscriberDiv = document.createElement('div'); // Create a div for the subscriber to replace
			subscriberDiv.setAttribute('id', stream.streamId); // Give the replacement div the id of the stream as its id.
			var container = "";
			var current_status = "";
			if(players.length == 0) {
				container = "missle";
				//current_status = "it's your turn";
			}
			else {
				container = "nex_player_holder";
				//current_status = "someone else's turn";
			}
			document.getElementById(container).appendChild(subscriberDiv);
			//$("#player_status").html(current_status);
			
			var subscriberProps = {width: 75,
								   height: 75,
								   subscribeToAudio: false};
			subscribers[stream.streamId] = session.subscribe(stream, subscriberDiv.id, subscriberProps);
			players.push(stream.streamId);
			
			// Rounded corners
			setTimeout(function() {
				//console.log(stream.streamId);
				for(var i in players) {
					console.log(i);
					var curr_id = $("[id^=subscriber_"+ players[i] +"]").attr("id");
					//console.log(curr_id);
					document.getElementById(curr_id).style.borderRadius = '75px';
					document.getElementById(curr_id).WebkitBorderRadius = '75px';
					document.getElementById(curr_id).MozBorderRadius = '75px';
				}
			}, 1000);
			
			
			
			// var subscriberDiv = document.createElement('div'); // Create a div for the subscriber to replace
			// subscriberDiv.setAttribute('id', stream.streamId); // Give the replacement div the id of the stream as its id.
			// document.getElementById("subscribers").appendChild(subscriberDiv);
			// subscribers[stream.streamId] = session.subscribe(stream, subscriberDiv.id);
		}

		function show(id) {
			document.getElementById(id).style.display = 'block';
		}

		function hide(id) {
			document.getElementById(id).style.display = 'none';
		}
		
		function switchVideoFeed() {
			if(players.length != 1) {
				var curr_id = $("[id^=subscriber_"+ players[index_player] +"]").attr("id");
				var curr_player = document.getElementById(curr_id);
				document.getElementById('nex_player_holder').appendChild(curr_player);
				
				index_player += 1;
				
				if(index_player == players.length) {
					index_player = 0;
				}
				curr_id = $("[id^=subscriber_"+ players[index_player] +"]").attr("id");
				curr_player = document.getElementById(curr_id);
				var current_status;
				if(parseInt(players[index_player],10) == my_streamId) {
					current_status = "it's your turn";
				}
				else {
					current_status = "other player's turn";
				}
				$("#player_status").html(current_status);
				//document.getElementById('container_next_player').appendChild(curr_player);
				$('#' + curr_id).remove();
				$('#missle').html(curr_player);
				
			}
		}

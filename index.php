<?php
   require_once 'sdk/API_Config.php';
   require_once 'sdk/OpenTokSDK.php';
   
   $a = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);
   //$token = $a->generate_token();
   //$session = $a->create_session('127.0.0.1')->getSessionId();
   $session = "2_MX43MDU4MDAyfjEyNy4wLjAuMX4yMDExLTEyLTA4IDIwOjAxOjM3LjUyMjA2MCswMDowMH4wLjk3MTcyMjQ1NzY3OX4";
   $token = $a->generate_token($session);
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
		<title>AngryHeads - powered by OpenTok</title>
		<script src="http://staging.tokbox.com/v0.91/js/TB.min.js" type="text/javascript" charset="utf-8"></script>
		<script type="text/javascript" src="io/dist/socket.io.js"></script>
		
		<script type="text/javascript">
			var apiKey = 7058002;
			var sessionId = '<?php echo $session; ?>';
			var token = '<?php echo $token ?>';
			console.log(sessionId);
			console.log(token);
		</script>
		<script src="js/tb.js" type="text/javascript" charset="UTF-8"></script>
		<script type="text/javascript" src="js/jquery-1.5.1.min.js" ></script>
		<script type="text/javascript" src="js/math.js"></script>
		<script type="text/javascript" src="js/game.js"></script>
		<script type="text/javascript" src="js/canvas.js"></script>
		<link href="css/game.css" rel="stylesheet" type="text/css"/>
		<!--
		
  ___                         _   _                _     
 / _ \                       | | | |              | |    
/ /_\ \_ __   __ _ _ __ _   _| |_| | ___  __ _  __| |___ 
|  _  | '_ \ / _` | '__| | | |  _  |/ _ \/ _` |/ _` / __|
| | | | | | | (_| | |  | |_| | | | |  __/ (_| | (_| \__ \
\_| |_/_| |_|\__, |_|   \__, \_| |_/\___|\__,_|\__,_|___/
              __/ |      __/ |                           
             |___/      |___/                            
	
		-->
	</head>
	<body>
		<!--
			CSS3 background code provided by:
			http://acrisdesign.com/2010/08/create-animated-landscape-using-pure-css3/
		-->
		<div id="canvas_background">
			<div id="sky">
<!-- 				<div id="cloud_1">
					<div class="ele1 ele"></div>
					<div class="ele2 ele"></div>
					<div class="ele3 ele"></div>
					<div class="ele4 ele"></div>
				</div>
				<div id="cloud_2">
					<div class="ele1 ele"></div>
					<div class="ele2 ele"></div>
					<div class="ele3 ele"></div>
					<div class="ele4 ele"></div>
				</div>
				<div id="cloud_4">
					<div class="ele1 ele"></div>
					<div class="ele2 ele"></div>
					<div class="ele3 ele"></div>
					<div class="ele4 ele"></div>
				</div>
				<div id="cloud_3">
					<div class="ele1 ele"></div>
					<div class="ele2 ele"></div>
					<div class="ele3 ele"></div>
					<div class="ele4 ele"></div>
				</div> -->
			</div>
			<div id="land"></div>
		</div>
		<canvas id="game_canvas" width="1152" height="500"></canvas>
		<div id="container_game">
			<div id="missle"></div>
			<div id="player_status"></div>
			<div id="container_next_player">
				<div id="next_player_title">Player Queue</div>
				<div id="nex_player_holder"></div>
			</div>
			<div id="main_title">AngryHeads</div>
		</div>

		<div id="modal_cover"></div>
		<div id="module_camera">
			<div id="module_title">angryHeads</div>
			<div id="publisher_camera"></div>
			<div id="module_instructions">Once you're camera is on, click button below</div>
			<div id="module_button_close">lets play</div>
		</div>
	</body>
</html>

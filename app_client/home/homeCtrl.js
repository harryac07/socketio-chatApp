angular
	.module('productFinder')
	.controller('homeCtrl', homeCtrl);


function homeCtrl($scope, $routeParams, $location, auth) { // service as parameter(auth-authentication)

	/* Socket starts here */
	var socket = io('http://localhost:3000');

	// check if user log in and only perform chat
	if (window.localStorage['user-token']) {
		var user = JSON.parse(window.atob(window.localStorage['user-token'].split('.')[1])).name;
		// var room=user+Date.now(); // make unique room using date
		var userList = [];

		console.log(user);
		$('#chat-form').submit(function(e) {

			if ($('#text').val() != '' || null) {
				socket.emit('chat message', $('#text').val());
				$('#text').val('');
				return false;
			}

			e.preventDefault();
		});

		/* adding user to room */
		socket.emit('adduser', user);

		/* all online users */
		socket.on('users', function(user) {
			userList = [];
			userList = user;
			$("#users").html('');
			for (var i = 0; i < user.length; i++) {

				$("#users").append("<p>" + user[i] + "</p>");
			}

			/* private message */
			setTimeout(function() {
				$('#users p').click(function(e) {

					var toUser = $(this).text();
					$('#private-chat-form').submit(function(e) {

						if ($('#text2').val() != '' || null) {
							socket.emit('private message', user, toUser, $('#text2').val()); // emit for private chat
							$('#text2').val('');
							return false;
						}

						e.preventDefault();
						return false;
					});

					$('#chat-box').show();
					$('#nouser-box').show();
					e.preventDefault();

				});
			}, 200);

			/* message scroll for private chat */
			$('#chat-content').on('mousewheel DOMMouseScroll', function(e) {
				var e0 = e.originalEvent,
					delta = e0.wheelDelta || -e0.detail;

				this.scrollTop += (delta < 0 ? 1 : -1) * 25;
				e.preventDefault();
			});
			// $("#users").html("<p><a>" + userList.join('<br><hr>') + "</a></p>");
		});

		/*notification bell click event*/

		$('#notification-bell').one('click',function(){
			// $('#notification').show();
			$('#notification-bell').css('color', 'black');
			// setTimeout(function(){
			// 	$('#notification').hide();
			// },2000);
			
		});

		/* getting chat message and posting to view */
		socket.on('chat message', function(msg) {
			var timestamp = moment.utc(msg.date); //
			$('#content')
				.prepend("<div style='margin:0'><span style='font-weight:bold;font-size:22px'>" + msg.user + "</span>" + " : <span style='font-size:20px'>" + msg.message + "</span><span style='float:right'>" + timestamp.local().format('YYYY-MM-DD, hh:mm a') + "</span></div><hr>");
		});

		/* getting private chat message and posting to view */
		socket.on('private message', function(msg) {
			console.log(msg);

			var timestamp = moment.utc(msg.date); //
			$('#chat-content')
				.prepend("<div style='margin:0'><span style='font-weight:bold;font-size:20px'>" + msg.user + "</span>" + " : <span style='font-size:17px'>" + msg.message + "</span><span style='float:right'>" + timestamp.local().format('YYYY-MM-DD, hh:mm a') + "</span></div><hr>");

		});



		/* user greeting message from server */
		socket.on('newclientconnect', function(server, data) {
			console.log(server + ' : ' + data);
		});

		/* notification to user when mesage received */
		socket.on('notification', function(data) {
			$('#notification-bell').css('color', 'red');
			$('#notification').html(data);
		});


		/* when user disconnects from room */
		socket.on('disconnectMessage', function(data) {
			console.log(data.description);
		});

		$("#chat-close").click(function() {
			$('#chat-box').hide();
		});


	} else {
		$('#content').html('Please Login to start chat!!');
	}

}
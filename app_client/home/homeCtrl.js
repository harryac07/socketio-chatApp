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
		var userList = []; // array to store online users

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
		socket.on('users', function(users) {
			userList = [];
			userList = users;
			$("#users").html('');
			for (var i = 0; i < users.length; i++) {

				$("#users").append("<p>" + users[i] + "</p>");
			}

			/* private message */
			setTimeout(function() {

				$.toUser = ""; // global variable to store userto name(user whom message is to sent)
				$('#users p').click(function(e) {

					e.preventDefault();

					$.toUser = $(this).text();

					var targetUser = $.toUser.replace(/\s+/g, '');
					// console.log($.toUser);

					$('.header-text').attr('id', targetUser + '1');
					// console.log($('.header-text').attr('id'));
					$('#' + targetUser + '1').html($.toUser);
					var toAppend = $(".user").html();
					// console.log(toAppend);
					$('#chat1').append("<div class='user open' id='" + targetUser + "'>" + toAppend + "</div>");



				}); /* click ends here */

				/* need maintenance*/
				$('div').on('click','#close',function() {
					
					$('.user').hide();
				});


			}, 200);
			$("div").on("focus", "#text2", function(event) {
				/* gets the first ancestor element that matches the given selector '.user'*/
				var toUser = ($(this).parent().closest('.user').find('.header-text').text());

				$("div").on("keydown", "#text2", function(e) {
					if (e.which == 13) {
						e.preventDefault();
						// console.log(user + ' : touser :' + toUser + ',,,' + $(this).val());
						if ($(this).val() != '' || null) {
							socket.emit('private message', user, toUser, $(this).val()); // emit for private chat
							$(this).val('');
							return false;

						}
					}
				});

			});
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

		$('#notification-bell').one('click', function() {

			$('#notification-bell').css('color', 'black');

		});

		/* getting chat message and posting to view */
		socket.on('chat message', function(msg) {
			var timestamp = moment.utc(msg.date); //
			$('#content')
				.prepend("<div style='margin:0'><span style='font-weight:bold;font-size:22px'>" + msg.user + "</span>" + " : <span style='font-size:20px'>" + msg.message + "</span><span style='float:right'>" + timestamp.local().format('YYYY-MM-DD, hh:mm a') + "</span></div><hr>");
		});

		/* getting private chat message and posting to view */
		socket.on('private message', function(msg) {

			var senderUser = msg.user.replace(/\s+/g, '');
			var targetUser = msg.toUser.replace(/\s+/g, '');

			var timestamp = moment.utc(msg.date); //
			$('#' + targetUser + ' .message-area,#' + senderUser + ' .message-area').css('display', 'inline-block');
			// console.log('targetUser : ' + targetUser + '  senderUser : '+senderUser);
			$('#' + targetUser + ' .message-area,#' + senderUser + ' .message-area')
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
			$('#notification').html(data.description);
			setTimeout(function() {
				$('#notification').html('');
			}, 2000);

		});


		$("#chat-close").click(function() {
			$(this).hide();
		});


	} else {
		$('#content').html('Please Login to start chat!!');
	}

}
angular
	.module('socketio')
	.controller('homeCtrl', homeCtrl);


function homeCtrl($scope, $routeParams, $location, auth) { // service as parameter(auth-authentication)


	// check if user log in and only start chat
	if (window.localStorage['user-token']) {
		/* Socket starts here */ // only if user has logged In
		var socket = io('http://localhost:3000');
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
				/* Highlight current loggedIn user */
				var required_user = new RegExp(user, "g");
				console.log(user);

				$('#users p:contains("' + user + '")').each(function() {
					$(this).html(
						$(this).html().replace(user, '<span class="highlight">' + user + '</span>')
					);
				});
				// $('#users p').css("color","red");

				var div_header_names = []; // array containing name of chat-div header name
				var targetUser = "";
				$.toUser = ""; // global variable to store userto name(user whom message is to be sent)
				$('#users p').click(function(e) {
					
					$.toUser = $(this).text();

					targetUser = $.toUser.replace(/\s+/g, '');
					// console.log($.toUser);

					$('.header-text').attr('id', targetUser + '1');
					// console.log($('.header-text').attr('id'));
					$('#' + targetUser + '1').html($.toUser);
					var toAppend = $(".user").html();
					// console.log(toAppend);
					console.log(div_header_names);
					console.log(targetUser);
					if (jQuery.inArray(targetUser, div_header_names) != -1) {
						//do nothing if the user found in div_header_names

					} else {
						div_header_names.push(targetUser); // push the name to array so that div dont open with that name again
						/* User cannot chat himself and cannot open chat div also for now: */
						if (user.replace(/\s+/g, '') != targetUser) {
							$('#chat1').append("<div class='user open' id='" + targetUser + "'>" + toAppend + "</div>");
						}

					}

				}); /* click ends here */


				$('div').on('click', '#close', function() {
					var header_name = $(this).parent().find('.header-text').text();
					var index = div_header_names.indexOf(header_name);
					div_header_names.splice(index, 1); // remove the div_header_name from array to prevent repeated
					$(this).parent().parent().hide();

				});


			});
			$("div").on("focus", "#text2", function(event) {
				/* gets the first ancestor element that matches the given selector '.user'*/
				var toUser = ($(this).parent().closest('.user').find('.header-text').text());
				$("div").on("keydown", "#text2", function(e) {

					console.log("to user : " + toUser);
					if (e.which == 13) {
						e.preventDefault();
						console.log(user + ' : touser :' + toUser + ',,,' + $(this).val());
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

			/* handling message appearance into div */
			console.log(user.replace(/\s+/g, '') + " : " + senderUser);
			if ($('#' + targetUser + ' .message-area').parent().find('.header-text').text().replace(/\s+/g, '') == senderUser.replace(/\s+/g, '')) {
				console.log('self chat');
				$('#' + senderUser + ' .message-area')
					.prepend("<div style='margin:0'><span style='font-weight:bold;font-size:20px'>" + msg.user + "</span>" + " : <span style='font-size:17px'>" + msg.message + "</span><span style='float:right'>" + timestamp.local().format('YYYY-MM-DD, hh:mm a') + "</span></div><hr>");


			} else {
				console.log('no self chat');
				$('#' + targetUser + ' .message-area,#' + senderUser + ' .message-area')
					.prepend("<div style='margin:0'><span style='font-weight:bold;font-size:20px'>" + msg.user + "</span>" + " : <span style='font-size:17px'>" + msg.message + "</span><span style='float:right'>" + timestamp.local().format('YYYY-MM-DD, hh:mm a') + "</span></div><hr>");
			}

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
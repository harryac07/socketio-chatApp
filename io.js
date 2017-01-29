var app = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var clients = 0; // for counting number of user connected
var usernames = {};
var allUsers = [];
var uniqueUsers = [];
var room = "room1";

//sends current users to provided socket
function sendCurrentUsers(socket) {

	var info = usernames[socket.id];

	var users = [];

	if (typeof info === 'undefined') {
		return;
	}
	Object.keys(usernames).forEach(function(socketId) {
		var userInfo = usernames[socketId];
		console.log('userInfo : ' + userInfo); // for name
		users.push(userInfo);

	});
	console.log('users :' + users);
	io.sockets.emit('users', users);
}
io.on('connection', function(socket) {
	console.log('user : ' + socket.id + ' connected');

	socket.emit('newclientconnect', 'SERVER: ', ' Welcome to chat!');

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(user) {

		// send client to room
		socket.join(room);
		// store the username in the socket session for this client
		// add the client's username to the global list
		usernames[socket.id] = user;
		socket.username = user;
		// store the room name in the socket session for this client
		socket.room = room;
		// echo to client they've connected
		socket.emit('newclientconnect', 'SERVER: ', 'you have connected to ' + room);
		// echo to room  that a person has connected to their room
		socket.broadcast.to(room).emit('newclientconnect', 'SERVER: ', socket.username + ' has connected to this room');
		console.log('socketid : ' + Object.keys(usernames));

		sendCurrentUsers(socket);
		return;
		// io.sockets.emit('users', uniqueUsers);

	});
	/* group chat for specific room */
	socket.on('chat message', function(msg) {
		// console.log(socket.username + ' : ' + msg);

		io.to(room).emit('chat message', {
			message: msg,
			user: socket.username,
			date: moment().valueOf() //date: moment(new Date()).format('YYYY-MM-DD, hh:mm a')
		});
	});

	/* private chat using name */
	socket.on('private message', function(user, toUser, msg) {

		console.log(socket.username + ' : to- ' + toUser + ' : ' + msg);
		Object.prototype.getKey = function(value) {
			for (var key in this) {
				if (this[key] == value) {
					return key;
				}
			}
			return null;
		};
		var key = usernames.getKey(toUser);
		// console.log(io.nsps['/'].adapter.rooms[room1].length);

		io.to(key).to(socket.id).emit('private message', {
			message: msg,
			user: socket.username,
			toUser: toUser,
			date: moment().valueOf() //date: moment(new Date()).format('YYYY-MM-DD, hh:mm a')
		});
		io.to(key).emit('notification',"You have text from "+socket.username+"<br>"+msg);

	});

	/* when user disconnect */
	socket.on('disconnect', function() {

		if (typeof usernames[socket.id] !== 'undefined') {
			socket.leave(usernames[socket.id].room);
			console.log('user disconnected');
			// remove the username from global usernames list
			delete usernames[socket.id];
			sendCurrentUsers(socket);
			io.to(room).emit('disconnectMessage', {
				description: socket.username + ' has left!'
			});
		}


	});
	// 	console.log(Object.keys(usernames).length);
	//  console.log('session usernames: '+socket.username);
});


// io.sockets.connected //Return {socket_1_id: {}, socket_2_id: {}} . This is the most convenient one, since you can just refer to io.sockets.connected[id] then do common things like emit()
// io.sockets.sockets //Returns [{socket_1}, {socket_2}, ....]. Can refer to socket_i.id to distinguish
// io.sockets.adapter.sids //Return {socket_1_id: {}, socket_2_id: {}} . Looks similar to the first one but the object is not actually the socket, just the information.

// // Not directly helps but still relevant
// io.sockets.adapter.rooms //Returns {room_1_id: {}, room_2_id: {}}
// io.sockets.server.eio.clients //Return client sockets
// io.sockets.server.eio.clientsCount //Return number of connected clients
// /*
// * SOcket.broadcast.emit  ----emits to everyone except to the person who emits
// * io.emit ----- emits to everyone including to person who emits
// */

module.exports = io;
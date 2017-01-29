var request = require('request');

// Mongoose Model
var mongoose = require('mongoose');

var apiOptions = {
	server: "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
	apiOptions.server = 'http://localhost:3000';
}

module.exports.angularApp = function(req, res) {
	res.render('layout', {
		title:"hello"
	});

};
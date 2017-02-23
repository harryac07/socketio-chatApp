var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
// load the auth variables
var configAuth = require('./auth');


/* for local passport */
passport.use(new LocalStrategy({
		usernameField: 'email'
	},
	function(email, password, done) {
		console.log('username in line 17 passport   : ' + email);
		// Upto here, it gives email as a username successfully
		User.findOne({
			'email': email
		},function(err, user) {
			console.log("Object.prototype: ", Object.prototype);
			if (err) {
				// gives error here
				console.log(err);
				return done(err);
			}
			if (!user) {
				return done(null, false, {
					"message": "Incorrect Username."
				});
			}
			if (!user.validPassword(password)) {
				return done(null, false, {
					"message": "Incorrect Password." + password
				});
			}
			return done(null, user);

		});
	}
));

/* facebook auth */
passport.use('facebook', new FacebookStrategy({

		// pull in our app id and secret from our auth.js file
		clientID: configAuth.facebookAuth.clientID,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL,
		passReqToCallback: true,
		profileFields: ['id', 'name', 'emails']

	},
	// facebook will send back the token and profile
	function(req, token, refreshToken, profile, done) {

		User.findOne({
			'email': profile.emails[0].value
		}, function(err, user) {
			if (err) {
				console.log('her is error');
				return done(err);

			}

			if (user) {

				return done(null, user);

			} else {
				// if there is no user, create them
				var newUser = new User();

				newUser.verifyToken = token;
				newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
				newUser.email = (profile.emails[0].value || '').toLowerCase();
				newUser.verified = true; // verified true if signup using facebook
				//create a random salt and hash (not in use though)
				newUser.setPassword((token + profile.emails[0].value + Math.random()).toString()); // use setPassword method to set salt and hash
				newUser.account = 'facebook';

				newUser.save(function(err) {
					if (err) {
						console.log('here is error');
						return done(err);
					}

					return done(null, newUser);
				});
			}
		});


	}));
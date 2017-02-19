var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

// create a schema
var userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	account:{
		type: String,
		required: true
	},
	verified: {
		type: Boolean,
		default: false
	},
	admin: {
		type: Boolean,
		default: false
	},
	verifyToken: {
		type: String
	},
	tokenExpiryTime:{
		type:Date
	},
	hash: String,
	salt: String
});

userSchema.methods.setPassword = function(password) {
	this.salt = crypto.randomBytes(16).toString('hex'); // creating a random string for salt
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex'); // create encryted hash
};

userSchema.methods.validPassword = function(password) { // validating submitted password
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	if(this.hash === hash){
		console.log('password ok'); // testing purpose
	}else{
		console.log("password incorrect in user schema");
	}
	
	return this.hash === hash;
};
userSchema.methods.generateJwt = function() {
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + 7); // create expiry date obj and set expiry for 7 days

	return jwt.sign({
		_id: this._id,
		email: this.email,
		name: this.name,
		admin: this.admin,
		verified:this.verified,
		exp: parseInt(expiry.getTime() / 1000)
	}, process.env.JWT_SECRET);
};

/* complile the schema into a model */
module.exports =mongoose.model('User', userSchema); //'modelname' , 'schema name'
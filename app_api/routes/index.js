var express = require('express');
var passport = require('passport');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({ // setting up the authentication
	secret: process.env.JWT_SECRET,
	userProperty: 'payload' //define property on req to be payload
});

var ctrlAuth = require('../controllers/authentication');


// /* USER routes */
router.post('/register', ctrlAuth.register);
/* facebook first login */
router.get('/auth/facebook', passport.authenticate('facebook', {
	scope: 'email'
}));
//facebook callback
router.get('/auth/facebook/callback', ctrlAuth.facebookLogin);

/* local email login */
router.post('/login', ctrlAuth.login);

router.get('/verify/:token', ctrlAuth.verify);
router.post('/forgotPwd', ctrlAuth.forgotPwd);
router.post('/resetpassword/:token',ctrlAuth.resetpassword);
router.get('/users', ctrlAuth.getUsers);



module.exports = router;
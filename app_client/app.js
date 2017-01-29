angular
	.module('productFinder', ['ngRoute', 'ngSanitize'])
	.config(['$routeProvider', config]);

function config($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'home/home.html',
			controller: 'homeCtrl'

		})
		.when('/register', {
			templateUrl: 'register/register.html',
			controller: 'registerCtrl'
		})
		.when('/verify/:token', {
			templateUrl: 'register/verify.html',
			controller: 'registerCtrl'
		})
		.when('/reset', {
			templateUrl: 'resetPassword/reset.html',
			controller: 'resetCtrl'
		})
		.when('/resetpassword/:token', {
			templateUrl: 'resetPassword/resetpassword.html',
			controller: 'resetpasswordCtrl'
		})
		.when('/resetpassword', {
			templateUrl: 'resetPassword/resetSuccess.html',
			controller: 'resetpasswordCtrl'
		})
		.when('/login', {
			templateUrl: 'login/login.html',
			controller: 'loginCtrl'
		})
		.when('/facebook/:token', {
			templateUrl: 'social/facebook.html',
			controller: 'facebookCtrl'
		})
		.otherwise({
			redirectTo: '/'
		})
}
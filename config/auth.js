// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: 'your-secret-clientID-here', // your App ID
		'clientSecret' 	: 'your-client-secret-here', // your App Secret
		'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'your-consumer-key-here',
		'consumerSecret' 	: 'your-client-secret-here',
		'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '117163683510-g54tc2kl4mla1uocm3dp7v6kj7620h6b.apps.googleusercontent.com',
		'clientSecret' 	: '4irciCkFNEZrR4hA5hXNVN1L',
		'callbackURL' 	: 'http://track4sure.southindia.cloudapp.azure.com:8080/auth/google/callback'
	}

};

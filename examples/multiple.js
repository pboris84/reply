var reply = require('./../');

var bye = function(){
	console.log("Ok, maybe next time.");
}

var get_input = function(){

	reply.confirm('Hi, i\'m a robot that memorizes your email and password, will you teach me yours?', function(err, yes){

	  if (!err && yes)
	    console.log("Alright, let\'s learn");
	  else
	    return console.log("ok, shutting down.");

		reply.get({ email: 'type out your email', password: { type: 'password'} }, function(err, result){

			if (err) return bye();
			console.log(result);

			reply.confirm('I memorized it! Is this right:', function(err, yes){

					if (err || !yes)
						get_input();
					else
						console.log("Awesome! shutting down!")

			})

		})

	});
	
}

get_input();
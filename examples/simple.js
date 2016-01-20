var options = {
	what_is_your_name: '',
	and_what_is_your_major: ''
}

var reply = require('./..');

reply.get(options, function(err, answers){
	console.log("\nHere\'s what I got:");
	console.log(answers);
});

var reply = require('reply');

reply.confirm('Are you up for it?', function(err, yes) {
  var answer = (!err && yes) ? "That's crack-a-lackin!" : 'Bummer.';
  console.log(answer);
});
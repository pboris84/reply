var reply = require('./../');

var bye = function(){
  console.log('Ok, maybe next time.');
}

function get_timezone() {
  var date = new Date();
  return date.getTimezoneOffset();
}

var opts = {
  fingers: {
    message: 'How many fingers do you have?'
  },
  timezone: {
    message: 'And your current timezone is?',
    default: get_timezone
  }
}

reply.get(opts, function(err, result){
  if (err) return bye();

  console.log(result);
})

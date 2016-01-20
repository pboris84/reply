var reply = require('./../');

var bye = function(){
  console.log("Thanks for playing!");
}

function get_timezone() {
  var date = new Date();
  return date.getTimezoneOffset();
}

var opts = {
  ice_cream: {
    message: 'My favorite ice cream is chocolate, what\'s your favorite ice cream?',
    options: ['Chocolate', 'Vanilla', 'Mint Chocolate', 'Strawberry', 'ice cream sucks']
  },
    no_ice_cream: {
    message: 'Hmm, I guess we can\'t be friends',
    depends_on: {
      ice_cream: { not: 'Chocolate' }  
    },
  },
  first_question: {
    message: 'what\'s the square root of 36?',
    options: [1,2,3,4,5,6]
  },
  second_question: {
    message: 'Nice!, Now what\'s the capitol of Russia?',
    // regex: /3.14159265/,
    depends_on: {
      first_question: 6,
    }
  },
  you_win: {
    message: 'You did it, YOU WIN!',
    depends_on: {
      second_question: 'Moscow',
    }
  },
  try_again: {
    message: 'Try again?',
    type: 'boolean',
    default: true
  }
}

function start() {
  reply.get(opts, function(err, result){
    if (err || !result.try_again)
      bye();
    else
      start();
  })
}

start();

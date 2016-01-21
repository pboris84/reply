/*
Establishes the required tools to interact with the program,
and sets up that tool to be used elsewhere in the program.
*/ 
var reply = require('reply');

var opts = {
  name: {
    message : 'Please type in your name.',
    allow_empty: false // will require an answer
  },
  username: {
    default : 'nobody', // if left empty, will fall back to this value
    type    : 'string'    // ensure value is not a number
  },
  gender: {
    options : ['Male', 'Female', 'Robot', 'Rather not say']
  },
  password: {
    message : 'Password, please.',
    type    : 'password',
    regex   : /(\w{6})/,
    error   : 'Six chars minimum. Try again.'
  },
  country: {
    message : 'Where are you now?',
    default : get_country // use the function below to provide a default/fallback answer
  },
  zip_code: {
    message : 'Please enter your ZIP code.',
    type    : 'number', // reply uses the JS primitives, as returned by `typeof var`
    depends_on: {
      country: 'US'
    }
  }
}


function get_country(answers) {
  // answers contains the values given up to this point.
  if (answers.username == 'billgates')
    return 'US';
  else // we'll simply guess it from the LANG variable
    return process.env.LANG.split(/_|\./)[1]; 
}

reply.get(opts, function(err, answers) {
  console.log(answers); 
  /* { name: 'Bill Gates', 
       username: 'billgates',
       gender: 'Robot', 
       password: '123456',
       country: 'US',
       zip_code: 12345 } */
});


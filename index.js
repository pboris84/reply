/*
Establishes the required tools to interact with the program,
and sets up that tool to be used elsewhere in the program.
*/ 
var rl, readline = require('readline');

/*
Builds a tool for the user to interact with the program, first by checking
if the required tools are there, and if they are, to use standard input and
output tools. Then it stores that interaction tool for later use.

@function get_interface
@param {Object} stdin - Standard in stream
@param {Object} stdout - Standard out stream
@returns {Object} - readline interface
*/
var get_interface = function(stdin, stdout) {
  if (!rl) rl = readline.createInterface(stdin, stdout); //builds interface if it doesn't exist
  else stdin.resume(); 
  return rl;
}

/*
Builds a tool that can referenced by other programs, it is meant as a confirmation
of whatever the user wants. 

@function confirm
@param {String} message - Preset message
@exports the confirm @module
@callback waits on user response
    @param {String} answer
    @param error
*/
var confirm = exports.confirm = function(message, callback) {
    
  // sets up the options for the get method
  var question = {
    'reply': {
      type: 'confirm',
      message: message,
      default: 'yes'
    }
  }
  
  // waits for user responses and callbacks if that
  // response exists 
  get(question, function(err, answer) {
    if (err) return callback(err);
    callback(null, answer.reply === true || answer.reply == 'yes');
  });

};


/*
A tool that can get various different things based on what specifics the user needs,
and that does the majority of the functionality for reply

@function get
@param {Object} options - the series of questions or interactions for the user
@exports the get @module
@callback waits on user response 
    @param error
@returns 
    {null} - if no callback occurs
    {error} - if no object in options
    otherwise it returns the submethod's return value
*/
var get = exports.get = function(options, callback) {

  if (!callback) return; // no point in continuing

  if (typeof options != 'object')
    return callback(new Error("Please pass a valid options object."))
    
  // builds an array that manages the interaction results  
  var answers = {},
      stdin = process.stdin,
      stdout = process.stdout,
      fields = Object.keys(options);

  // A tool that ends the get callback 
  // @function done
  var done = function() {
    close_prompt();
    callback(null, answers);
  }

  
  
  // A tool that ends the input interaction from the user
  // @function close_prompt
  // @return {null}
  var close_prompt = function() {
    stdin.pause();
    if (!rl) return;
    rl.close();
    rl = null;
  }
  
  
    
  // A tool that returns the default set of questions based on a key given by the user
  // @function get_default 
  // @param {String} key - the reference key for the default question
  // @return {Object[]} either the default key, answer key, or just the answer options
  var get_default = function(key, partial_answers) {
    if (typeof options[key] == 'object')
      return typeof options[key].default == 'function' ? options[key].default(partial_answers) : options[key].default;
    else
      return options[key];
  }
  

  
  // A tool that tells you what type of content the input was
  // @function guess_type
  // @param {String} reply - the user input
  // @return {null} - if there is no input
  //         {String} - if it matches to expected input or is a string
  //         {int} - if its proven both the input is a string and
  //                 int modified input is a string
  
  var guess_type = function(reply) {

    if (reply.trim() == '')
      return;
    else if (reply.match(/^(true|y(es)?)$/))
      return true;
    else if (reply.match(/^(false|n(o)?)$/))
      return false;
    else if ((reply*1).toString() === reply)
      return reply*1;

    return reply;
  }
  

  
  // A tool that verifies if a given input key matches an answer
  // @function validate
  // @param {String} key - the user input
  // @param {String} answer - the answer its compared against
  // @return {Object[]} - based on where there is a match, isn't
  //                      a match, or it's undefined.
  //           {boolean} - if no conditions are met.
  var validate = function(key, answer) {

    if (typeof answer == 'undefined')
      return options[key].allow_empty || typeof get_default(key) != 'undefined';
    else if(regex = options[key].regex)
      return regex.test(answer);
    else if(options[key].options)
      return options[key].options.indexOf(answer) != -1;
    else if(options[key].type == 'confirm')
      return typeof(answer) == 'boolean'; // answer was given so it should be
    else if(options[key].type && options[key].type != 'password')
      return typeof(answer) == options[key].type;

    return true;

  }
  

  
  // A tool that shows you the error in your key answer comparison
  // @function show_error
  // @param {String} key - the user input
  var show_error = function(key) {
    var str = options[key].error ? options[key].error : 'Invalid value.';

    if (options[key].options)
        str += ' (options are ' + options[key].options.join(', ') + ')';

    stdout.write("\0x33[31m" + str + "\0x33[0m" + "\n");
  }
  

  
  // A tool that shows a message
  // @function show_message
  // @param {String} key - the user input
  var show_message = function(key) {
    var msg = '';

    if (text = options[key].message)
      msg += text.trim() + ' ';

    if (options[key].options)
      msg += '(options are ' + options[key].options.join(', ') + ')';

    if (msg != '') stdout.write("\0x33[1m" + msg + "\0x33[0m\n");
  }
  
  
  
  // a tool that waits for a password, and masks it with *'s as the
  // user types it out
  // @function wait_for_password
  // @param {String} prompt - the user password
  // @callback {String} - waits for user response
  // @return {Callback(String)}
  var wait_for_password = function(prompt, callback) {

    var buf = '',
        mask = '*';

    var keypress_callback = function(c, key) {

      if (key && (key.name == 'enter' || key.name == 'return')) {
        stdout.write("\n");
        stdin.removeAllListeners('keypress');
        // stdin.setRawMode(false);
        return callback(buf);
      }

      if (key && key.ctrl && key.name == 'c')
        close_prompt();

      if (key && key.name == 'backspace') {
        buf = buf.substr(0, buf.length-1);
        var masked = '';
        for (i = 0; i < buf.length; i++) { masked += mask; }
        stdout.write('\r\0x33[2K' + prompt + masked);
      } else {
        stdout.write(mask);
        buf += c;
      }

    };

    stdin.on('keypress', keypress_callback);
  }
  

  // a tool that checks if a reply is invalid then uses a fallback reply from an answer index.
  // @function check_reply
  // @param {int} index - the index of the answer array to compare against
  // @param {int} curr_key - recursive cycle placeholder
  // @param {String} fallback - what is compared against reply
  // @param {String} reply - user input
  // @return {String} - the fallback answer
  var check_reply = function(index, curr_key, fallback, reply) {
    var answer = guess_type(reply);
    var return_answer = (typeof answer != 'undefined') ? answer : fallback;

    if (validate(curr_key, answer))
      next_question(++index, curr_key, return_answer);
    else
      show_error(curr_key) || next_question(index); // repeats current
  }
  
 
  // a tool that checks if a set of conditions are met in comparison to the array answers.
  // @function dependencies_met
  // @param {String[]} conds - the set of conditions
  // @return {boolen} - if they are met or not
  var dependencies_met = function(conds) {
    for (var key in conds) {
      var cond = conds[key];
      if (cond.not) { // object, inverse
        if (answers[key] === cond.not)
          return false;
      } else if (cond.in) { // array 
        if (cond.in.indexOf(answers[key]) == -1) 
          return false;
      } else {
        if (answers[key] !== cond)
          return false; 
      }
    }

    return true;
  }
  
 
  // a tool moves an index over to the next question for the user to see
  // @function next_question
  // @param {int} index - the index of the next question
  // @param {int} prev_key - the index of the previous question key
  // @param {String} answer - the user input
  // @return {next_question(int, int, null)} - recursive call
  // @return {done()} - exits the loop
  var next_question = function(index, prev_key, answer) {
    if (prev_key) answers[prev_key] = answer;
    
    //base case
    var curr_key = fields[index];
    if (!curr_key) return done();
    
    //recursive case
    if (options[curr_key].depends_on) {
      if (!dependencies_met(options[curr_key].depends_on))
        return next_question(++index, curr_key, undefined);
    }
    
    //building the response
    var prompt = (options[curr_key].type == 'confirm') ?
      ' - yes/no: ' : " - " + curr_key + ": ";

    var fallback = get_default(curr_key, answers);
    if (typeof(fallback) != 'undefined' && fallback !== '')
      prompt += "[" + fallback + "] ";

    show_message(curr_key);
    
    //password exception
    if (options[curr_key].type == 'password') {

      var listener = stdin._events.keypress; // to reassign down later
      stdin.removeAllListeners('keypress');

      // stdin.setRawMode(true);
      stdout.write(prompt);

      wait_for_password(prompt, function(reply) {
        stdin._events.keypress = listener; // reassign
        check_reply(index, curr_key, fallback, reply)
      });
    
    //otherwise establish these as the questions for readline
    } else {

      rl.question(prompt, function(reply) {
        check_reply(index, curr_key, fallback, reply);
      });

    }

  }
  
  // builds the readline
  rl = get_interface(stdin, stdout);
  next_question(0);
  
  // cancellation condition
  rl.on('close', function() {
    close_prompt(); // just in case

    var given_answers = Object.keys(answers).length;
    if (fields.length == given_answers) return;

    var err = new Error("Cancelled after giving " + given_answers + " answers.");
    callback(err, answers);
  });

}

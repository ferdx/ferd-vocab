var SAT = require('./sat');

var personify = require('extend');

var message = { mrkdwn: true };

var persona = {
    as_user: false,
    username: 'SAT Vocabulary',
    icon_emoji: ':blue_book:'
};

var Repertoire = {
  generate: function() {
    var target = SAT[Math.floor(Math.random() * SAT.length)];
    var foils = [];
    for (var i = 0; i < 4; i++) {
      foils.push(SAT[Math.floor(Math.random() * SAT.length)].g);
    }
    var quiz = {
      word: target.w,
      answer: target.g,
      foils: foils
    };
    return quiz;
  }
};

module.exports = function(ferd) {

  // set the emoji icon and display name
  personify(message, persona);

  // initiate the predicate function that lives in 
  // the current closure, to be updated later
  var predicate = function() { return false; };
  // a filter that returns the closure predicate
  // to be passed to observable transformation
  var predicateInjector = function(message) { 
    return predicate(message.text); 
  };
  // a similar closure pattern for updatable callback
  var handler = function() { return false; };
  var handlerInjector = function(response) { 
    return handler(response); 
  };


  var Game = {

    answer: null,

    reset: function() {
      predicate = function(str) {
        return str.match(/ferd vocab/i);
      }; // updating the listener
      handler = function (response) {
        message.text = "Game on! Type `exit` or to quit.";
        response.postMessage(message);
        setTimeout(function() { Game.prompt(response); }, 1000);
      }; // updating the handler
    },

    prompt: function(response) {
      var quiz = Repertoire.generate();
      var options = quiz.foils.slice();
      Game.answer = Math.floor(Math.random() * (options.length + 1));
      options.splice(Game.answer, 0, quiz.answer);
      message.text = 'What\'s the meaning of: *' + quiz.word + '*?';
      options.forEach(function(option, index) {
        message.text += ('\n`' + index.toString() + '` ' + option);
      });
      response.postMessage(message);
      Game.judge();
    },

    judge: function() {
      predicate = function(str) {
        return str.match(/^\d$/i) || 
               str.match(/^exit$/i) ||
               str.match(/^quit$/i);
      }; // updating the listener
      handler = function (response) {
        var trigger = response.incomingMessage.text.toLowerCase();
        if (trigger === 'exit' || trigger === 'quit') {
         message.text = "Thank you for playing.";
         response.postMessage(message);
         Game.reset(); 
        } else {
          if (parseInt(trigger) === Game.answer) {
            message.text = "Correct!";
            response.postMessage(message);
          } else {
            message.text = "The correct answer is: `" + Game.answer.toString() + '`';
            response.postMessage(message);
          }
          setTimeout(function() { Game.prompt(response); }, 1000);
        }
      }; // updating the handler
    },

  };

  Game.reset();

  ferd.hear(predicateInjector, /.*/, handlerInjector);

};

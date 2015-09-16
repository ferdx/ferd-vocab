var personify = require('extend');

var message = { mrkdwn: true };

var persona = {
    as_user: false,
    username: 'Ferd',
    icon_emoji: ':blue_book:'
};

var Repertoire = {
  generate: function() {
    var quiz = {
      word: 'lorem',
      answer: 'foo',
      foils: ['bar', 'baz', 'spam', 'bacon']
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
  var intercept = function(message) {
    return predicate(message.text);
  };

  // a similar closure pattern for updatable callback
  var handler = function() { return false; };
  var callback = function(response) { return handler(response); };


  var Game = {

    answer: null,

    reset: function() {
      predicate = function(str) {
        return str.match(/ferd vocab/i);
      }; // updating the listener
      handler = function (response) {
        message.text = "Game on! Type `exit` to quit.";
        response.postMessage(message);
        Game.prompt(response);
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
        return str.match(/^\d$/i) || str.match(/^exit$/i);
      }; // updating the listener
      handler = function (response) {
        message.text = "Hello!";
        response.postMessage(message);
        Game.prompt(response);
      }; // updating the handler
    },

  };

  Game.reset();

  ferd.hear(intercept, /.*/, callback);

};

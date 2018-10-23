var m = µ;

var template, totalTemplate, addPlayerTemplate, addDebitTemplate, commentTemplate;

var userRef = "";
var practiceRef = "";
var practice = {};
var players = [];

function savePractice () {
  if (!confirm('Geyma æfingu! Ertu viss?')) {
    return false;
  }

  // create a new practice, add it to the db and get its ID
  var practicesReg = firebase.database().ref(userRef + '/practices');
  var newPracticeRef = practicesReg.push();
  newPracticeRef.set({
    date: practice.date,
    comment: practice.comment,
    players: practice.players
  }, function(error) {
    if (error) {
      console.error(error);
    } else {
      window.location = "/";
    }
  });
}

function setup () {
  template = Handlebars.compile(document.querySelector('#person').innerHTML);
  totalTemplate = Handlebars.compile(document.querySelector('#totalTemplate').innerHTML);
  addPlayerTemplate = Handlebars.compile(document.querySelector('#addPlayerTemplate').innerHTML);
  addDebitTemplate = Handlebars.compile(document.querySelector('#addDebitTemplate').innerHTML);
  commentTemplate = Handlebars.compile(document.querySelector('#commentTemplate').innerHTML);

  m('#addPerson').on('click', addPerson);
  m('#savePractice').on('click', savePractice);
  m('#addComment').on('click', addComment);

  m('.js-overlay').on('click', function(e){
    m('.menu-wrapper').addClass('hide');
    m('body').removeClass('show-overlay');
  });
  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    document.querySelector('#players').innerHTML = ""
    // [END_EXCLUDE]
    if (user) {
      userRef = '/users/' + user.uid;

      return firebase.database().ref(`${userRef}/players`).once('value').then(function(snapshot) {
        var practicePlayers = [];
        snapshot.forEach((child) => {
          players.push({
            key: child.key,
            name: child.val().name,
            paid: child.val().paid
          });

          practicePlayers.push({
            key: child.key,
            beers: 0,
            debit: 0
          });
        });

        var now = new Date();
        practice = {
          date: now.getTime(),
          comment: "",
          players: practicePlayers
        };
        renderList();

        m("body").removeClass("loggedout");
      });
      // [START_EXCLUDE]
      

      // [END_EXCLUDE]
    } else {
      // User is signed out.
      window.location = "/login.html";
    }
  });
  // [END authstatelistener]
}


function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(setup);

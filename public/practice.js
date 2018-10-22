var m = µ;

var template, totalTemplate, loginTemplate, addPlayerTemplate, addDebitTemplate, commentTemplate;

var userRef = "";
var practiceRef = "";
var practice = {};
var players = [];
var practiceKey = "";

function logIn() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }
  // Sign in with email and pass.
  // [START authwithemail]
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode === 'auth/wrong-password') {
      alert('Wrong password.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END authwithemail]
}

function savePractice () {
  if (!confirm('Geyma æfingu! Ertu viss?')) {
    return false;
  }

  // create a new practice, add it to the db and get its ID
  var practicesReg = firebase.database().ref(userRef + '/practices/' + practiceKey);
  practicesReg.set({
    date: practice.date,
    comment: practice.comment,
    players: practice.players
  }, function(error) {
    if (error) {
      console.log(error);
    } else {
      window.location = "/";
    }
  });
}

function setup () {
  let urlParams = new URLSearchParams(window.location.search);
  practiceKey = urlParams.get('key');
  if(practiceKey === null || practiceKey.length === 0) {
    window.location = "/";
  }

  template = Handlebars.compile(document.querySelector('#person').innerHTML);
  totalTemplate = Handlebars.compile(document.querySelector('#totalTemplate').innerHTML);
  loginTemplate = Handlebars.compile(document.querySelector('#loginTemplate').innerHTML);
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
      m('#sign-in').off('click', logIn);

      return firebase.database().ref(`${userRef}/practices/${practiceKey}`).once('value').then(function(practiceSnapshot) {
        
        console.log(practiceSnapshot, practiceSnapshot.key, practiceSnapshot.val());

        firebase.database().ref(`${userRef}/players`).once('value').then(function(playersSnapshot) {
          playersSnapshot.forEach((child) => {
            players.push({
              key: child.key,
              name: child.val().name,
              paid: child.val().paid
            });
          });
  
          practice = {
            date: practiceSnapshot.val().date,
            comment: practiceSnapshot.val().comment,
            players: practiceSnapshot.val().players
          };
          renderList();
  
          m("body").removeClass("loggedout");
        });
      });
      // [START_EXCLUDE]
      

      // [END_EXCLUDE]
    } else {
      // User is signed out.
      m("body").addClass("loggedout");
      var rendered = loginTemplate({});
      document.querySelector('#players').innerHTML = rendered;
      m('#sign-in').on('click', logIn);
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

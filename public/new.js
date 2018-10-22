var m = µ;

var template, totalTemplate, loginTemplate, addPlayerTemplate, addDebitTemplate;

var userRef = "";
var practiceRef = "";
var practice = {};

function addComment() {
  var comment = practice.comment;
  var rendered = commentTemplate({comment: comment});
  document.querySelector('#players').innerHTML = rendered;

  document.getElementById('comment').focus();

  m("#saveComment").on('click', function(){
    var comment = document.getElementById('comment').value;
    if(comment.length === 0) {
      return
    }
    
    practice.comment = comment;

    m("#saveComment").off('click');
    m("#cancelComment").off('click');
    renderList();
  });

  m("#cancelComment").on('click', function(){
    m("#saveComment").off('click');
    m("#cancelComment").off('click');
    renderList();
  });
}

function addDebit(e) {
  var id = parseInt(e.target.getAttribute("data-id"));
  var name = practice.players[id].name;
  var rendered = addDebitTemplate({name: name});
  document.querySelector('#players').innerHTML = rendered;

  document.getElementById('debit').focus();

  m("#addDebit").on('click', function(){
    var debitString = document.getElementById('debit').value;
    if(debitString.length === 0) {
      return
    }

    var debit = parseInt(debitString);

    if(isNaN(debit)) {
      return
    }
    
    practice.players[id].debit = debit;

    m("#addDebit").off('click');
    m("#cancelAddDebit").off('click');
    renderList();
  });

  m("#cancelAddDebit").on('click', function(){
    m("#addDebit").off('click');
    m("#cancelAddDebit").off('click');
    renderList();
  });
}

function paySeason(e) {
  var id = parseInt(e.target.getAttribute("data-id"));
  var name = practice.players[id].name;
  if (!confirm('🤑 Borga æfingagjöld hjá ' + name + '! Ertu viss?')) {
    return false;
  }
  practice.players[id].paid = true;
  renderList();
}

function addPerson() {
  var rendered = addPlayerTemplate({});
  document.querySelector('#players').innerHTML = rendered;

  document.getElementById('playerName').focus();

  m("#addPlayer").on('click', function(){
    var name = document.getElementById('playerName').value;
    if(name.length === 0) {
      return
    }

    practice.players.push({
      name: name,
      beers: 0,
      debit: 0,
      paid: false
    })

    console.log(name, "added to list");
    m("#addPlayer").off('click');
    m("#cancelAddPlayer").off('click');
    renderList();
  });

  m("#cancelAddPlayer").on('click', function(){
    m("#addPlayer").off('click');
    m("#cancelAddPlayer").off('click');
    renderList();
  });
}

function renamePerson (e) {
  var id = parseInt(e.target.getAttribute("data-id"));
  var name = practice.players[id].name;

  var rendered = addPlayerTemplate({name: name});
  document.querySelector('#players').innerHTML = rendered;
  document.getElementById('playerName').focus();

  m("#addPlayer").on('click', function(){
    var newName = document.getElementById('playerName').value;
    if(newName.length === 0) {
      return
    }
    
    practice.players[id].name = newName;
    
    m("#addPlayer").off('click');
    m("#cancelAddPlayer").off('click');
    renderList();
  });

  m("#cancelAddPlayer").on('click', function(){
    m("#addPlayer").off('click');
    m("#cancelAddPlayer").off('click');
    renderList();
  });
}

function addBeer (e) {
  var id = parseInt(e.target.getAttribute("data-id"));
  var beerCount = practice.players[id].beers;
  practice.players[id].beers = parseInt(beerCount) + 1;
  renderList();
}

function removeBeer (e) {
  var id = parseInt(e.target.getAttribute("data-id"));
  var beerCount = practice.players[id].beers;
  practice.players[id].beers = parseInt(beerCount) - 1;
  renderList();
}


function renderList () {  
  console.log("Render list");
  var dateString = new Date(practice.date);

  document.querySelector('#date').innerText = "Æfing fyrir " + dateString.toDateString();

  var rendered = template(practice);
  document.querySelector('#players').innerHTML = rendered;

  var totalBeers = 0;

  practice.players.forEach(function(person){
    totalBeers = totalBeers + parseInt(person.beers);
  });

  var totalRendered = totalTemplate({beers: totalBeers*10});
  document.querySelector('#total').innerHTML = totalRendered;

  m('.beerup').on('click', addBeer);
  m('.beerdown').on('click', removeBeer);
  m('.rename').on('click', renamePerson);
  m('.addDebit').on('click', addDebit);
  m('.paySeason').on('click', paySeason);
  m('.js-menu').on('click', function(e) {
    var wrapper = this.querySelector('.menu-wrapper');

    if (wrapper.classList.contains('hide')) {
      m('.menu-wrapper').addClass('hide');
      m('body').addClass('show-overlay');
      wrapper.classList.remove('hide');
    } else{
      wrapper.classList.add('hide');
      m('body').removeClass('show-overlay');
    };
  });

}


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
  var practicesReg = firebase.database().ref(userRef + '/practices');
  var newPracticeRef = practicesReg.push();
  newPracticeRef.set({
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

      return firebase.database().ref(`${userRef}/practices`).orderByChild('date').limitToLast(1).once('value').then(function(snapshot) {
        var players = [];
        snapshot.forEach((child) => {
          console.log(child.key, child.val());
          if(child.val().players) {
            players = child.val().players;
            players.forEach(function(player) {
              player.beers = 0;
              player.debit = 0;
            });
          }
        });

        var now = new Date();
        practice = {
          date: now.getTime(),
          comment: "",
          players: players
        };
        renderList();

        m("body").removeClass("loggedout");
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

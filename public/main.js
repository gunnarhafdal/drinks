Array.prototype.removeAt = function(id) {
    for (var item in this) {
        if (this[item].id == id) {
            this.splice(item, 1);
            return true;
        }
    }
    return false;
}

var m = µ;

var template, totalTemplate, emailTemplate, loginTemplate, addPlayerTemplate;

function addPerson() {
  var rendered = Mustache.render(addPlayerTemplate, {});
  document.querySelector('#players').innerHTML = rendered;

  document.getElementById('playerName').focus()

  m("#addPlayer").on('click', function(){
    var name = document.getElementById('playerName').value;
    if(name.length === 0) {
      return
    }

    var peopleRef = firebase.database().ref('players/');
    var newPersonRef = peopleRef.push();

    newPersonRef.set({
      name: name,
      beerCount: 0,
      practiceBeerCount: 0,
      paidAutumn: false,
      paidSpring: false
    });
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
  var id = e.target.getAttribute("data-id");
  firebase.database().ref('players/' + id).once('value').then(function(snapshot) {
    var name = (snapshot.val() && snapshot.val().name) || '';
    var rendered = Mustache.render(addPlayerTemplate, {name: name});
    document.querySelector('#players').innerHTML = rendered;
    document.getElementById('playerName').focus();

    m("#addPlayer").on('click', function(){
      var newName = document.getElementById('playerName').value;
      if(newName.length === 0) {
        return
      }
      
      var updates = {};
      updates['players/' + id +'/name'] = newName;
      firebase.database().ref().update(updates);
      
      m("#addPlayer").off('click');
      m("#cancelAddPlayer").off('click');
      renderList();
    });
  
    m("#cancelAddPlayer").on('click', function(){
      m("#addPlayer").off('click');
      m("#cancelAddPlayer").off('click');
      renderList();
    });
  });
}

function addBeer (e) {
  var id = e.target.getAttribute("data-id");
  return firebase.database().ref('players/' + id).once('value').then(function(snapshot) {
    var beerCount = (snapshot.val() && snapshot.val().beerCount) || 0;
    var practiceBeerCount = (snapshot.val() && snapshot.val().practiceBeerCount) || 0;

    var updates = {};
    updates['players/' + id +'/beerCount'] = parseInt(beerCount) + 1;
    updates['players/' + id +'/practiceBeerCount'] = parseInt(practiceBeerCount) + 1;
    return firebase.database().ref().update(updates);
  });
}

function removeBeer (e) {
  var id = e.target.getAttribute("data-id");
  return firebase.database().ref('players/' + id).once('value').then(function(snapshot) {
    var beerCount = (snapshot.val() && snapshot.val().beerCount) || 0;
    var practiceBeerCount = (snapshot.val() && snapshot.val().practiceBeerCount) || 0;

    var updates = {};
    updates['players/' + id +'/beerCount'] = parseInt(beerCount) - 1;
    updates['players/' + id +'/practiceBeerCount'] = parseInt(practiceBeerCount) - 1;
    return firebase.database().ref().update(updates);
  });
}

function resetList (e) {
  if (!confirm('Ertu viss?')) {
    return false;
  }
  var updates = {};
  var playersRef = firebase.database().ref('players');
  playersRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      updates['players/' + childKey +'/beerCount'] = 0;
      updates['players/' + childKey +'/practiceBeerCount'] = 0;
    });
  });
  return firebase.database().ref().update(updates);
}

function resetPracticeList (e) {
  if (!confirm('Ertu viss?')) {
    return false;
  }
  var updates = {};
  var playersRef = firebase.database().ref('players');
  playersRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      updates['players/' + childKey +'/practiceBeerCount'] = 0;
    });
  });
  return firebase.database().ref().update(updates);
}

function renderList () {  
  console.log("Render list");
  var data = {players: []};

  var playersRef = firebase.database().ref('players');
  playersRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      childData.id = childKey
      data.players.push(childData);
    });
  });

  var rendered = Mustache.render(template, data);
  document.querySelector('#players').innerHTML = rendered;

  var totalBeers = 0;
  data.players.forEach(function(person){
    if (!person.hasOwnProperty('practiceBeerCount')) {
      person.practiceBeerCount = 0;
    }

    if (!person.practiceBeerCount) {
      person.practiceBeerCount = 0;
    }
    
    totalBeers = totalBeers + parseInt(person.beerCount);
  });

  var totalRendered = Mustache.render(totalTemplate, {beers: totalBeers*10});
  document.querySelector('#total').innerHTML = totalRendered;

  // then we add them again
  m('.beerup').on('click', addBeer);
  m('.beerdown').on('click', removeBeer);
  m('.rename').on('click', renamePerson);
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

function sendList () {
  var data = {players: []};
  
  var playersRef = firebase.database().ref('players');
  playersRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      childData.id = childKey
      data.players.push(childData);
    });
  });

  var totalBeers = 0;
  data.players.forEach(function(person){
    totalBeers = totalBeers + parseInt(person.beerCount);
  });

  var view = {
    totalAmount: totalBeers*10,
    players: data.players, 
    date: date,
    debt: function(){
      var price = this.beerCount * 10;
      return price+"kr";
    },
    beerText: function() {
      return  (this.beerCount % 10 !== 1 || this.beerCount % 100 === 11) ? "bjóra" : "bjór";
    }
  };

  var date = new Date();
  var emailBody = Mustache.render(emailTemplate, view);
  
  var link = "mailto:" + "?subject="+encodeURIComponent("Drykkja: " + date) + "&body=" + encodeURIComponent(emailBody);
  window.location.href = link;  
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


function setup () {
  template = document.querySelector('#person').innerHTML;
  Mustache.parse(template);
  totalTemplate = document.querySelector('#totalTemplate').innerHTML;
  Mustache.parse(totalTemplate);
  emailTemplate = document.querySelector('#emailTemplate').innerHTML;
  Mustache.parse(emailTemplate);
  loginTemplate = document.querySelector('#loginTemplate').innerHTML;
  Mustache.parse(loginTemplate);
  addPlayerTemplate = document.querySelector('#addPlayerTemplate').innerHTML;
  Mustache.parse(addPlayerTemplate);

  m('#addPerson').on('click', addPerson);
  m('#resetList').on('click', resetList);
  m('#resetPracticeList').on('click', resetPracticeList);
  m('#sendList').on('click', sendList);

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
      m('#sign-in').off('click', logIn);
      // User is signed in.
      //uid = user.uid;
      // [START_EXCLUDE]
      var playersRef = firebase.database().ref('players');
      playersRef.on('child_added', function(data) {
        console.log("added", data.key, data.val());
        renderList();
      });
      
      playersRef.on('child_changed', function(data) {
        console.log("changed", data.key, data.val());
        renderList();
      });
      
      playersRef.on('child_removed', function(data) {
        console.log("delete", data.key);
        renderList();
      });

      m("body").removeClass("loggedout");

      // [END_EXCLUDE]
    } else {
      // User is signed out.
      m("body").addClass("loggedout");
      var rendered = Mustache.render(loginTemplate, {});
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

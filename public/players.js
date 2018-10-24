var template = {};
var m = µ;
var playersList = [];
var userId = "";

const renderPlayers = (snapshot) => {
  const players = snapshot.child('players');
  const practices = snapshot.child('practices');
  playersList = [];
  players.forEach((player) => {
    var newPlayer = {
      key: player.key,
      name: player.val().name,
      paid: player.val().paid,
      beers: 0,
      debit: 0
    };

    practices.forEach((practice) => {
      practice.val().players.forEach((p) => {
        if(p.key === player.key) {
          newPlayer.beers += p.beers;
          newPlayer.debit += p.debit;
        }
      });
    });

    playersList.push(newPlayer);
  });
  
  playersList.sort(compareNames);

  var data = {
    players: playersList
  }
  document.querySelector('.players').innerHTML = template(data);
  m('.payPlayerSeason').on('click', payPlayerSeason);
}

const payPlayerSeason = (e) => {
  e.preventDefault();
  var key = e.target.dataset.key;

  var name = "";
  playersList.forEach(function(player){
    if(player.key === key) {
      name = player.name;
    } 
  });

  if (!confirm(`🤑 Ætlar ${name} að borga æfingargjöldin núna?`)) {
    return false;
  }

  var updates = {};
    updates[`users/${userId}/players/${key}/paid`] = true;
    return firebase.database().ref().update(updates, function(error) {
    if (error) {
      console.error(error);
      return
    } else {
      firebase.database().ref(`users/${userId}`).once('value').then(function(snapshot) {
        renderPlayers(snapshot)
      });
    }
  });
}

const setup = () => {
  template = Handlebars.compile(document.querySelector('#player-list').innerHTML);

  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    
    // [END_EXCLUDE]
    if (user) {
      userId = user.uid;
      return firebase.database().ref(`users/${userId}`).once('value').then(function(snapshot) {
        renderPlayers(snapshot);
      });
    } else {
      window.location = "/login.html";
    }
  });
  // [END authstatelistener]
}

(() => {
  setup();
})();
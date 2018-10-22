var template = {};

const renderPlayers = (snapshot) => {
  const players = snapshot.child('players');
  const practices = snapshot.child('practices');
  var playersList = [];
  players.forEach((player) => {
    var newPlayer = {
      name: player.val().name,
      paid: player.val().paid ? "Já" : "Nei",
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
  console.log(playersList.length);

  var data = {
    players: playersList
  }
  console.log(data);
  console.log(template(data))
  document.querySelector('.players').innerHTML = template(data);
  
}

const setup = () => {
  template = Handlebars.compile(document.querySelector('#player-list').innerHTML);

  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    
    // [END_EXCLUDE]
    if (user) {
      return firebase.database().ref(`users/${user.uid}`).once('value').then(function(snapshot) {
        renderPlayers(snapshot)
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
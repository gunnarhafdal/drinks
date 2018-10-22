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
  var key = practice.players[id].key;
  var name = "";
  players.forEach(function(player){
    if(player.key === key) {
      name = player.name;
    } 
  });

  var debitValue = practice.players[id].debit === 0 ? "" : `${practice.players[id].debit}`

  var rendered = addDebitTemplate({name: name, debit: debitValue});
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
  var key = practice.players[id].key;

  var name = "";
  players.forEach(function(player){
    if(player.key === key) {
      name = player.name;
    } 
  });

  if (!confirm('🤑 Borga æfingagjöld hjá ' + name + '! Ertu viss?')) {
    return false;
  }

  var updates = {};
    updates[userRef + '/players/' + key +'/paid'] = true;
    return firebase.database().ref().update(updates, function(error) {
    if (error) {
      console.log(error);
      return
    } else {
      players.forEach(function(player){
        if(player.key === key) {
          player.paid = true;
        } 
      });
      renderList();
    }
  });
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

    // create a new practice, add it to the db and get its ID
    var playersReg = firebase.database().ref(userRef + '/players');
    var newPlayerRef = playersReg.push();
    return newPlayerRef.set({
      name: name,
      paid: false
    }, function(error) {
      if (error) {
        console.log(error);
        return
      } else {
        players.push({
          key: newPlayerRef.key,
          name: name,
          paid: false
        });

        practice.players.push({
          key: newPlayerRef.key,
          beers: 0,
          debit: 0
        });

        console.log(name, "added to list");
        m("#addPlayer").off('click');
        m("#cancelAddPlayer").off('click');
        renderList();
      }
    });
  });

  m("#cancelAddPlayer").on('click', function(){
    m("#addPlayer").off('click');
    m("#cancelAddPlayer").off('click');
    renderList();
  });
}

function renamePerson (e) {
  var id = parseInt(e.target.getAttribute("data-id"));
  var key = practice.players[id].key;

  var name = "";
  players.forEach(function(player){
    if(player.key === key) {
      name = player.name;
    } 
  });

  var rendered = addPlayerTemplate({name: name});
  document.querySelector('#players').innerHTML = rendered;
  document.getElementById('playerName').focus();

  m("#addPlayer").on('click', function(){
    var newName = document.getElementById('playerName').value;
    if(newName.length === 0) {
      return
    }
    
    var updates = {};
    updates[userRef + '/players/' + key +'/name'] = newName;
    return firebase.database().ref().update(updates, function(error) {
      if (error) {
        console.log(error);
        return
      } else {
        players.forEach(function(player){
          if(player.key === key) {
            player.name = newName;
          } 
        });
        m("#addPlayer").off('click');
        m("#cancelAddPlayer").off('click');
        renderList();
      }
    });
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

  var combinedPlayers = [];

  practice.players.forEach(function(practicePlayer) {
    players.forEach(function(player){
      if(practicePlayer.key === player.key) {
        combinedPlayers.push({
          name: player.name,
          beers: practicePlayer.beers,
          debit: practicePlayer.debit,
          paid: player.paid
        });
      }
    });
  });

  var practiceToBeRender = {
    players: combinedPlayers
  }

  var rendered = template(practiceToBeRender);
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

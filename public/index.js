var template = {};

const renderPractices = (snapshot) => {
  var practices = [];

  snapshot.forEach((child) => {
    var date = new Date(child.val().date);
    practices.push({
      key: child.key,
      date: date.toDateString(),
      comment: child.val().comment
    });
  });

  document.querySelector('.practices').innerHTML = template({practices: practices});
}

const setup = () => {
  template = Handlebars.compile(document.querySelector('#practice-list').innerHTML);

  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    
    // [END_EXCLUDE]
    if (user) {
      return firebase.database().ref(`users/${user.uid}/practices`).once('value').then(function(snapshot) {
        renderPractices(snapshot)
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
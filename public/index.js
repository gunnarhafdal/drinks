const renderPractices = (list) => {
  console.log(list);
}

const setup = () => {
  template = document.querySelector('#practice-list').innerHTML;
  Mustache.parse(template);

  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    
    // [END_EXCLUDE]
    if (user) {
      return firebase.database().ref(`users/${user.uid}/practices`).once('value').then(function(snapshot) {
        //console.log(snapshot.val());
        renderPractices(snapshot.val())
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
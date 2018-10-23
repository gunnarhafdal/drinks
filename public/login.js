function logIn() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  if (email.length < 4) {
    alert('Email vantar.');
    return;
  }
  if (password.length < 4) {
    alert('Lykilorð vantar.');
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
      alert('Rangt lykilorð.');
    } else {
      alert(errorMessage);
    }
    console.error(error);
    // [END_EXCLUDE]
  });
  // [END authwithemail]
}

(() => {

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location = "/";
    } else {
      µ('#sign-in').on('click', logIn);
    }
  });
  
})();


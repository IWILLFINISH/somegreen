var provider = new firebase.auth.GoogleAuthProvider();
var user;
var selectedFile;
var database = firebase.database();

$( document ).ready(function() {
	$("#welcome").hide();
	$("#uploadButton").hide();
	$(".upload-group").hide();
});

function signIn() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a Google Access Token. You can use it to access the Google API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
	   user = result.user;
	  showWelcomeContainer();
	  sessionStorage.token = token;
	  // ...
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  // ...
		console.log(user)
		provider.setCustomParameters({
    'name': 'Введите ваше имя'
});
		// Step 1.
// User tries to sign in to Google.
auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function(error) {
  // An error happened.
  if (error.code === 'auth/account-exists-with-different-credential') {
    // Step 2.
    // User's email already exists.
    // The pending Google credential.
    var pendingCred = error.credential;
    // The provider account's email address.
    var email = error.email;
    // Get sign-in methods for this email.
    auth.fetchSignInMethodsForEmail(email).then(function(methods) {
      // Step 3.
      // If the user has several sign-in methods,
      // the first method in the list will be the "recommended" method to use.
      if (methods[0] === 'password') {
        // Asks the user their password.
        // In real scenario, you should handle this asynchronously.
        var password = promptUserForPassword(); // TODO: implement promptUserForPassword.
        auth.signInWithEmailAndPassword(email, password).then(function(user) {
          // Step 4a.
          return user.linkWithCredential(pendingCred);
        }).then(function() {
          // Google account successfully linked to the existing Firebase user.
          goToApp();
        });
        return;
      }
      // All the other cases are external providers.
      // Construct provider object for that provider.
      // TODO: implement getProviderForProviderId.
      var provider = getProviderForProviderId(methods[0]);
      // At this point, you should let the user know that they already has an account
      // but with a different provider, and let them validate the fact they want to
      // sign in with this provider.
      // Sign in to provider. Note: browsers usually block popup triggered asynchronously,
      // so in real scenario you should ask the user to click on a "continue" button
      // that will trigger the signInWithPopup.
      auth.signInWithPopup(provider).then(function(result) {
        // Remember that the user may have signed in with an account that has a different email
        // address than the first one. This can happen as Firebase doesn't control the provider's
        // sign in flow and the user is free to login using whichever account they own.
        // Step 4b.
        // Link to Google credential.
        // As we have access to the pending credential, we can directly call the link method.
        result.user.linkAndRetrieveDataWithCredential(pendingCred).then(function(usercred) {
          // Google account successfully linked to the existing Firebase user.
          goToApp();
        });
      });
    });
  }
});
	});

};

function showWelcomeContainer() {
	$("#login").hide();
	$("#welcome").show();
	$(".upload-group").show();
	$("#welcomeText").html("Привет, " + user.email);
};

$(".dropdown").on("hide.bs.dropdown", function(event){
    var text = $(event.relatedTarget).text(); // Get the text of the element
    $("#dogDrop").html(text+'<span class="caret"></span>');
    firebase.database().ref('Users/' + user.uid).set({
    	name: user.displayName,
    	email: user.email,
    	favDog: text
  	});

});

$("#file").on("change", function(event) {
	selectedFile = event.target.files[0];
	$("#uploadButton").show();
});

function uploadFile() {
		alert("Изображение отправлено! ")
	// Create a root reference
	var filename = selectedFile.name;
	var storageRef = firebase.storage().ref('/dogImages/' + filename);
	var uploadTask = storageRef.put(selectedFile);

	// Register three observers:
	// 1. 'state_changed' observer, called any time the state changes
	// 2. Error observer, called on failure
	// 3. Completion observer, called on successful completion
	uploadTask.on('state_changed', function(snapshot){
	  // Observe state change events such as progress, pause, and resume
	  // See below for more detail
	}, function(error) {
	  // Handle unsuccessful uploads
	}, function() {
	  // Handle successful uploads on complete
	  // For instance, get the download URL: https://firebasestorage.googleapis.com/...
	  var postKey = firebase.database().ref('Posts/').push().key;
	  var downloadURL = uploadTask.snapshot.downloadURL;
	  var updates = {};
	  var postData = {
	  	url: downloadURL,
	  	caption: $("#imageCaption").val(),
	  	user: user.uid
	  };
	  updates['/Posts/'+postKey] = postData;
	  firebase.database().ref().update(updates);

	});

}
alertr(user.email)

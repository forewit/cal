// Import the functions you need from the SDKs you need
import { getAuth, signInWithPopup, GithubAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js'

// Setup Firebase Auth
const provider = new GithubAuthProvider();
const auth = getAuth();

// Track auth state -------------------------------
window.onload = function () {
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            document.getElementById('sign-in-status').textContent = 'Signed in';
            document.getElementById('account-details').textContent = user.displayName;
            document.getElementById('sign-in-button').textContent = 'Sign out';
        } else {
            // User is signed out.
            document.getElementById('sign-in-status').textContent = 'Signed out';
            document.getElementById('account-details').textContent = 'null';
            document.getElementById('sign-in-button').textContent = 'Sign in';
        }
    }, function (error) {
        console.log(error);
    });
}
// ------------------------------------------------


// when sign in button is clicked, then sign in with GitHub
document.getElementById('sign-in-button').addEventListener('click', function () {
    if (auth.currentUser) {
        // User is signed in.

        // Sign out ---------------------------------------
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log('signed out.');
        }).catch((error) => {
            // An error happened.
            console.error(error);
        });
        // -------------------------------------------------
    } else {
        // No user is signed in.

        // Sign in with GitHub -----------------------------
        signInWithPopup(auth, provider)
            .then(result => {
                // This gives you a GitHub Access Token. You can use it to access the GitHub API.
                const credential = GithubAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;

                // The signed-in user info.
                const user = result.user;

                //...
                console.log(user);
            }).catch(error => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = GithubAuthProvider.credentialFromError(error);

                // ...
                console.error(errorCode, errorMessage, email, credential);
            });
        // -------------------------------------------------
    }
});

/*
// Get a reference to the database service
let database = firebase.database();
let ref = database.ref("data/");


// -----------------------------
// READ from realtime db

// value event triggers on every change
ref.on('value', function (snapshot) {
    console.log("updated value: ", snapshot.val());
});

// read once
ref.once('value').then(function (snapshot) {
    console.log("read value once: ", snapshot.val());
});


// -----------------------------
// WRITE to realtime db
ref.set({ name: "calendar" }, function (error) {
    if (error) {
        console.log("write failed!");
    } else {
        console.log("write successful!");
    }
});
*/
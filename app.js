// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js'
import { getFirestore, setDoc, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js'
import { getDatabase, ref, onValue, get, set, remove } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsBkU7NKqKn9gAV07V_21AkQMw3ZJQ9hQ",
    authDomain: "canvas-2fdd2.firebaseapp.com",
    databaseURL: "https://canvas-2fdd2.firebaseio.com",
    projectId: "canvas-2fdd2",
    storageBucket: "canvas-2fdd2.appspot.com",
    messagingSenderId: "989212373436",
    appId: "1:989212373436:web:2491b895c5a13ec3007bb9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GithubAuthProvider();
const auth = getAuth();
const db = getFirestore(app);
const realtimeDB = getDatabase();


// Track auth state -------------------------------
window.onload = function () {
    // Listen for auth state changes
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            document.getElementById('account-details').textContent = 'Signed in as: ' + user.displayName;
            document.getElementById('sign-in-button').textContent = 'Sign out';

            // update firestore login count
            document.getElementById('login-count').classList.remove('hidden');
            getLoginCount(user.uid).then(function (data) {
                document.getElementById('login-count').textContent = 'Login count: ' + data;
            });

            // update realtime database
            set(ref(realtimeDB, 'users/' + user.uid), {
                name: user.displayName,
            });
        } else {
            // User is signed out.
            document.getElementById('account-details').textContent = 'Signed out';
            document.getElementById('sign-in-button').textContent = 'Sign in with GitHub';
            document.getElementById('login-count').classList.add('hidden');
        }
    }, function (error) {
        console.log(error);
    });

    // get online users
    onValue(ref(realtimeDB, "users"), (snapshot) => {
        if (snapshot.exists()) {
            let users = snapshot.val();
            let onlineUsers = '';
            for (let user in users) 
                onlineUsers += users[user].name + '<br>';
            
            document.getElementById('online-users').innerHTML = onlineUsers;
        } else {
            document.getElementById('online-users').innerHTML = 'No users online';
        }
    });
}

window.onbeforeunload = function(){
    if (auth.currentUser) {
        preSignOut(auth.currentUser.uid);
    }
 }
// ------------------------------------------------

async function preSignOut(uid) {
    get(ref(realtimeDB, "users/" + uid)).then(function (data) {
        return data.sessionCount;
    }).catch(function (error) {
        console.log(error);
    });

    remove(ref(realtimeDB, 'users/' + uid));
}

// Sign in and out -------------------------------
document.getElementById('sign-in-button').addEventListener('click', function () {
    if (auth.currentUser) {
        // User is signed in.
        preSignOut(auth.currentUser.uid);
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log('signed out.');
        }).catch((error) => {
            // An error happened.
            console.error(error);
        });
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
// ------------------------------------------------

// read / write data in firestore -------------------
async function getLoginCount(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        let oldCount = docSnap.data().loginCount;
        let newCount = oldCount + 1;

        // update the document
        await setDoc(doc(db, "users", uid), { loginCount: newCount });

        console.log("Incrementing user login count to: ", newCount);
        return newCount;
    } else {
        // doc.data() will be undefined in this case
        // create a new document
        await setDoc(doc(db, "users", uid), { loginCount: 1 });

        console.log("Document doesn't exist, creating: ", uid);
        return 1;
    }
}
// ------------------------------------------------


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
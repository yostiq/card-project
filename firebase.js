let firebaseConfig = {
    apiKey: "AIzaSyCshPRphIpHeg5sj1i6O0K8iHcWxr5JVFQ",
    authDomain: "cardgame-project.firebaseapp.com",
    databaseURL: "https://cardgame-project.firebaseio.com",
    projectId: "cardgame-project",
    storageBucket: "cardgame-project.appspot.com",
    messagingSenderId: "576386674320",
    appId: "1:576386674320:web:0f8db7c2c8550a0cfbb215",
    measurementId: "G-45VCDFQGH3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        document.getElementById("loginLinks").style.display = "none";
        document.getElementById("userPanel").style.display = "flex";

        db.collection("users").doc(firebase.auth().currentUser.uid).get()
            .then((doc) => {
                console.log(doc.data());
                let username = doc.data().displayName[0].toUpperCase() + doc.data().displayName.slice(1);
                console.log(username);
                document.getElementById("textUsername").innerHTML = username;
            });

        db.collection("users").doc(firebase.auth().currentUser.uid)
            .onSnapshot(function (doc) {
                document.getElementById("textMoneyLeft").innerHTML = doc.data().money;
            });
    } else {
        console.log("No users logged in");
        document.getElementById("loginLinks").style.display = "flex";
        document.getElementById("userPanel").style.display = "none";
    }
});

function login() {
    let email = document.getElementById("inputUsername").value;
    let password = document.getElementById("inputPassword").value;

    email += "@randomemail.com";
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            cancelButton();
        })
        .catch(function (error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            if (errorCode === "auth/user-not-found") {
                document.getElementById("inputUsername").setCustomValidity("Username or password is incorrect");
            }
        });
}

function logOut() {
    firebase.auth().signOut().catch((error) => console.log(error));
}

function createUser() {
    let username = document.getElementById("inputUsername").value;
    let password = document.getElementById("inputPassword").value;
    let confirmPassword = document.getElementById("inputConfirmPassword").value;

    if (password !== confirmPassword) {
        document.getElementById("inputConfirmPassword").setCustomValidity("Passwords don't match");
    } else {
        document.getElementById("inputConfirmPassword").setCustomValidity("");
        document.getElementById("inputUsername").setCustomValidity("");
        let email = username + "@randomemail.com";
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                console.log("UserId: " + firebase.auth().currentUser.uid);
                db.collection("users").doc(firebase.auth().currentUser.uid).set({
                    displayName: username.toLowerCase(),
                    money: 500
                }).then(() => {
                    cancelButton();
                }).catch(function (error) {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    console.log(errorCode);
                    console.log(errorMessage);
                    if (errorCode === "auth/invalid-email") {
                        document.getElementById("inputUsername").setCustomValidity("Only letters and numbers are allowed.");
                    } else {
                        document.getElementById("inputUsername").setCustomValidity(errorMessage);
                    }
                });
            });
    }
}
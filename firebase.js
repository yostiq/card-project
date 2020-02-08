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

if (localStorage.getItem("loggedIn")) {
    document.getElementById("loginLinks").style.display = "none";
    document.getElementById("userPanel").style.display = "flex";

    if (localStorage.getItem("username")) {
        document.getElementById("textUsername").innerHTML = localStorage.getItem("username");
        if (localStorage.getItem("money")) {
            document.getElementById("textMoneyLeft").innerHTML = localStorage.getItem("money");
        }
    }

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            db.collection("users").doc(firebase.auth().currentUser.uid).get()
                .then((doc) => {
                    console.log(doc.data())
                    let username = doc.data().displayName[0].toUpperCase() + doc.data().displayName.slice(1);
                    console.log(username);
                    document.getElementById("textUsername").innerHTML = username;
                    localStorage.setItem("username", username);
                });

            db.collection("users").doc(firebase.auth().currentUser.uid)
                .onSnapshot(function (doc) {
                    document.getElementById("textMoneyLeft").innerHTML = doc.data().money;
                    localStorage.setItem("money", doc.data().money);
                });
        } else {
            document.getElementById("loginLinks").style.display = "flex";
            document.getElementById("userPanel").style.display = "none";
            localStorage.clear();
        }
    });
} else {
    document.getElementById("loginLinks").style.display = "flex";
    document.getElementById("userPanel").style.display = "none";
}

function login() {
    let email = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    email += "@randomemail.com";
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById("loginForm").reset();
            localStorage.setItem("loggedIn", "1");
            location.reload();
        }).catch(function (error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });
}

function logOut() {
    firebase.auth().signOut().catch((error) => console.log(error));
    localStorage.clear();
    location.reload();
}

function createUser() {
    let username = document.getElementById("createUsername").value;
    let password = document.getElementById("createPassword").value;
    let confirmPassword = document.getElementById("createConfirmPassword").value;

    if (password !== confirmPassword) {
        document.getElementById("createConfirmPassword").setCustomValidity("Passwords don't match");
    } else {
        document.getElementById("createConfirmPassword").setCustomValidity("");
        document.getElementById("createUsername").setCustomValidity("");
        let email = username + "@randomemail.com";
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                console.log("UserId: " + firebase.auth().currentUser.uid);
                db.collection("users").doc(firebase.auth().currentUser.uid).set({
                    displayName: username,
                    money: 500
                }).then(() => {
                    document.getElementById("logonForm").reset();
                    localStorage.setItem("loggedIn", "1");
                    location.reload();
                });
            }).catch(function (error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            if(errorCode === "auth/email-already-in-use"){
                document.getElementById("createUsername").setCustomValidity("Username is already in use");
            }
        });
    }
}
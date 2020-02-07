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

let deck_id = "";

window.onclick = (event) => {
    if (event.target === document.getElementById("logonBackground")) {
        document.getElementById("logonBackground").style.display = "none";
    } else if (event.target === document.getElementById("loginBackground")) {
        document.getElementById("loginBackground").style.display = "none";
    }
};

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        document.getElementById("loginLinks").style.display = "none";
        document.getElementById("userPanel").style.display = "flex";

        db.collection("users").doc(firebase.auth().currentUser.uid).get()
            .then((doc) => {
                console.log(doc.data());
                let username = doc.data().displayName;
                document.getElementById("textUsername").innerHTML = username[0].toUpperCase() + username.slice(1);
            })
            .catch((error) => console.log(error));

        db.collection("users").doc(firebase.auth().currentUser.uid)
            .onSnapshot(function (doc) {
                document.getElementById("textMoneyLeft").innerHTML = doc.data().money;
            });
    } else {
        document.getElementById("loginLinks").style.display = "flex";
        document.getElementById("userPanel").style.display = "none";
    }
});

async function getDeck(amount) {
    let url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=" + amount;
    if (deck_id === null || deck_id === "") {
        await fetch(url)
            .then((response) => response.json())
            .then((json) => {
                deck_id = json.deck_id;
            })
            .catch((error) => console.log(error));
    }
    return deck_id;
}

async function drawCard(amount, player) {
    console.log(deck_id);
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=" + amount;

    await fetch(url)
        .then((response) => response.json())
        .then((json) => addToHand(json, player))
        .catch((error) => console.log(error))
}

function addToHand(json, player) {
    console.log("addToHand: ");
    console.log(json);
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + player + "/add/?cards=";

    for (let i = 0; i < json.cards.length; i++) {
        if (i === json.cards.length - 1) {
            url += json.cards[i].code;
        } else {
            url += json.cards[i].code + ",";
        }
    }

    fetch(url)
        .catch((error) => console.log(error));
}

function createUser() {
    let username = document.getElementById("createUsername");
    let password = document.getElementById("createPassword");
    let confirmPassword = document.getElementById("createConfirmPassword");
    console.log(username.value);
    console.log(password.value);
    console.log(confirmPassword.value);

    if (password.value !== confirmPassword.value) {
        document.getElementById("createConfirmPassword").setCustomValidity("Passwords don't match");
    } else {
        document.getElementById("createConfirmPassword").setCustomValidity("");
        let email = username.value + "@randomemail.com";
        firebase.auth().createUserWithEmailAndPassword(email, password.value)
            .then(() => {
                console.log("UserId: " + firebase.auth().currentUser.uid);
                db.collection("users").doc(firebase.auth().currentUser.uid).set({
                    displayName: username.value,
                    money: 500
                });
            }).then(() => {
            document.getElementById("logonBackground").style.display = "none";
        }).catch(function (error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            alert(errorMessage);
        });
    }
}

function login() {
    let email = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    email += "@randomemail.com";
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById("loginBackground").style.display = "none";
        }).catch(function (error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });
}

function logOut() {
    firebase.auth().signOut().catch((error) => console.log(error));
}

function cancelButton() {
    document.getElementById("loginBackground").style.display = "none";
    document.getElementById("logonBackground").style.display = "none";
}

document.getElementById("drawCard").addEventListener("click", function () {
    getDeck(1)
        .then(() => drawCard(5, "amin"));
});


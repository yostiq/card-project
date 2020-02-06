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

let deck_id;

window.onclick = (event) => {
    if (event.target === document.getElementById("logonBackground")) {
        document.getElementById("logonBackground").style.display = "none";
    }
};

function getDeck(amount) {
    let url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=" + amount;

    let playerCards = document.getElementById("playerCards");
    playerCards.innerHTML = "";

    fetch(url)
        .then((response) => response.json())
        .then((json) => {
            deck_id = json.deck_id;
            document.getElementById("deckId").innerHTML = deck_id;
        })
        .catch((error) => console.log(error));
}

function drawCard(amount) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=" + amount;

    fetch(url)
        .then((response) => response.json())
        .then((json) => addToHand(json))
        .catch((error) => console.log(error));
}

function addToHand(json) {
    console.log(json);
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + "player1" + "/add/?cards=";

    for (let i = 0; i < json.cards.length; i++) {
        if (i === json.cards.length - 1) {
            url += json.cards[i].code;
        } else {
            url += json.cards[i].code + ",";
        }
    }

    fetch(url)
        .then((response) => response.json())
        .then(listHand())
        .catch((error) => console.log(error));
}

function listHand() {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + "player1" + "/list/";

    fetch(url)
        .then((response) => response.json())
        .then((json) => {
            let playerCards = document.getElementById("playerCards");
            playerCards.innerHTML = "";
            for (let i = 0; i < json.piles.player1.cards.length; i++) {
                let img = document.createElement("img");
                img.className = "card";
                img.src = "cards/" + json.piles.player1.cards[i].code + ".png";
                playerCards.appendChild(img);
            }

        })
        .catch((error) => console.log(error));
}

function createUser() {
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let confirmPassword = document.getElementById("confirmPassword");
    console.log(username.value);
    console.log(password.value);
    console.log(confirmPassword.value);

    if(password.value !== confirmPassword.value){
        document.getElementById("confirmPassword").setCustomValidity("Passwords don't match");
    } else {
        document.getElementById("confirmPassword").setCustomValidity("");
        let email = username.value + "@randomemail.com";
        firebase.auth().createUserWithEmailAndPassword(email, password.value)
            .then(() => {
                console.log("UserId: " + firebase.auth().currentUser.uid);
                db.collection("users").doc(firebase.auth().currentUser.uid).set({
                    money: 500
                });
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
    let email = document.getElementById("username2").value;
    let password = document.getElementById("password2").value;

    email += "@randomemail.com";
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });
}
window.onclick = (event) => {
    if (event.target === document.getElementById("logonBackground")) {
        cancelButton();
    } else if (event.target === document.getElementById("loginBackground")) {
        cancelButton();
    }
};

document.querySelector("#openPoker").addEventListener("click", async function () {
    openPoker();
});

document.querySelector("#openBlackjack").addEventListener("click", async function () {
    openBlackjack();
});

function cancelButton() {
    let element = document.getElementById("logonBackground");
    element.parentNode.removeChild(element);
}

function openPoker() {
    if (!userLogged) {
        alert("You must be logged in to play");
        return;
    }

    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/txt/poker.txt";

    fetch(file)
        .then(response => response.text())
        .then(data => document.getElementById("gameBackground").innerHTML = data)
        .then(() => document.getElementById("gameBackground").style.display = "flex")
        .then(() => askMinBet())
        .catch(error => console.log(error));
}

function openBlackjack() {
    if (!userLogged) {
        alert("You must be logged in to play");
        return;
    }

    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/txt/blackjack.txt";
    //let file = "txt/blackjack.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.getElementById("gameBackground").innerHTML = data)
        .then(() => {
            document.getElementById("gameBackground").style.display = "flex";
            updatePlayerMoney();
        })
        .catch((error) => console.log(error));
}

function closeGame() {
    document.getElementById("gameBackground").innerHTML = "";
    document.getElementById("gameBackground").style.display = "none";
}

function openLoginScreen() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/txt/loginScreen.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.body.innerHTML += data)
        .then(() => {
            document.getElementById("inputUsername").focus();
            enterPress();
        })
        .catch((error) => console.log(error));
}

function openSignUpScreen() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/txt/signUpScreen.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.body.innerHTML += data)
        .then(() => {
            document.getElementById("inputUsername").focus();
            enterPress();
        })
        .catch((error) => console.log(error));
}

function enterPress() {
    document.getElementById("inputUsername").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("submitButton").click();
        }
    });

    document.getElementById("inputPassword").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("submitButton").click();
        }
    });

    if (document.getElementById("inputConfirmPassword") !== null) {
        document.getElementById("inputConfirmPassword").addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                document.getElementById("submitButton").click();
            }
        });
    }
}

function bjRules() {
    let bj = document.getElementById("bjRules");
    let poker = document.getElementById("pokerRules");
    let bjButton = document.getElementById("openBjRules");
    let pokerButton = document.getElementById("openPokerRules");

    if (bj.style.display === "none") {
        bj.style.display = "block";
        poker.style.display = "none";
        bjButton.style.backgroundColor = "#FFE0B5";
        pokerButton.style.backgroundColor = "#212d40";
        bjButton.style.color = "black";
        pokerButton.style.color = "white";
    } else {
        bj.style.display = "none";
        poker.style.display = "none";
        bjButton.style.backgroundColor = "#212d40";
        bjButton.style.color = "white";
    }
}

function pokerRules() {
    let bj = document.getElementById("bjRules");
    let poker = document.getElementById("pokerRules");
    let bjButton = document.getElementById("openBjRules");
    let pokerButton = document.getElementById("openPokerRules");

    if (poker.style.display === "none") {
        poker.style.display = "block";
        bj.style.display = "none";
        pokerButton.style.backgroundColor = "#FFE0B5";
        bjButton.style.backgroundColor = "#212d40";
        pokerButton.style.color = "black";
        bjButton.style.color = "white";
    } else {
        bj.style.display = "none";
        poker.style.display = "none";
        pokerButton.style.backgroundColor = "#212d40";
        pokerButton.style.color = "white";
    }
}

// https://stackoverflow.com/a/39914235
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
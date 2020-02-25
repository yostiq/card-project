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
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/poker.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.getElementById("gameBackground").innerHTML = data)
        .then(() => document.getElementById("gameBackground").style.display = "flex")
        .then(() => poker())
        .catch((error) => console.log(error));
}

function openBlackjack() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/blackjack.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.getElementById("gameBackground").innerHTML = data)
        .then(() => {
            document.getElementById("gameBackground").style.display = "flex";
            document.querySelector("#play-button").setAttribute("class", "");
            updatePlayerMoney();
            document.querySelector("#play-button").addEventListener("click", () => {
                playBlackjack()
                document.querySelector("#play-button").setAttribute("class", "hidden")
            })
            document.querySelector("#reset-button").addEventListener("click", () => {
                resetBlackjack()
                playBlackjack()
                document.querySelector("#reset-button").setAttribute("class", "hidden")
            })

            document.querySelector("#hit-button").addEventListener("click", hit)
            document.querySelector("#stay-button").addEventListener("click", stay)
            document.querySelector("#double-button").addEventListener("click", double)
            document.querySelector("#insurance-button").addEventListener("click", insurance)
        })
        .catch((error) => console.log(error));
}

function closeGame() {
    document.getElementById("gameBackground").innerHTML = "";
    document.getElementById("gameBackground").style.display = "none";
}

function openLoginScreen() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/loginScreen.txt";

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
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/signUpScreen.txt";

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
        if(event.key === "Enter"){
            event.preventDefault();
            document.getElementById("submitButton").click();
        }
    });

    document.getElementById("inputPassword").addEventListener("keypress", (event) => {
        if(event.key === "Enter"){
            event.preventDefault();
            document.getElementById("submitButton").click();
        }
    });

    if(document.getElementById("inputConfirmPassword") !== null){
        document.getElementById("inputConfirmPassword").addEventListener("keypress", (event) => {
            if(event.key === "Enter"){
                event.preventDefault();
                document.getElementById("submitButton").click();
            }
        });
    }
}
window.onclick = (event) => {
    if (event.target === document.getElementById("logonBackground")) {
        cancelButton();
    } else if (event.target === document.getElementById("loginBackground")) {
        cancelButton();
    }
};

function cancelButton() {
    let element = document.getElementById("logonBackground");
    element.parentNode.removeChild(element);
}

function openLoginScreen() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/JoonasTestBranch/loginScreen.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.body.innerHTML += data)
        .then(() => document.getElementById("inputUsername").focus())
        .catch((error) => console.log(error));
}

function openSignUpScreen() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/JoonasTestBranch/signUpScreen.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.body.innerHTML += data)
        .then(() => document.getElementById("inputUsername").focus())
        .catch((error) => console.log(error));
}
window.onclick = (event) => {
    if (event.target === document.getElementById("logonBackground")) {
        document.getElementById("logonForm").reset();
        document.getElementById("logonBackground").style.display = "none";
    } else if (event.target === document.getElementById("loginBackground")) {
        document.getElementById("loginForm").reset();
        document.getElementById("loginBackground").style.display = "none";
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
        .catch((error) => console.log(error));
}

function openSignUpScreen() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/JoonasTestBranch/signUpScreen.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.body.innerHTML += data)
        .catch((error) => console.log(error));
}
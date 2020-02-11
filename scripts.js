window.onclick = (event) => {
    if (event.target === document.getElementById("logonBackground")) {
        document.getElementById("logonForm").reset();
        document.getElementById("logonBackground").style.display = "none";
    } else if (event.target === document.getElementById("loginBackground")) {
        document.getElementById("loginForm").reset();
        document.getElementById("loginBackground").style.display = "none";
    }
};

function showLogScreen(id) {
    document.getElementById(id).style.display = "table";
}

function cancelButton() {
    document.getElementById("loginBackground").style.display = "none";
    document.getElementById("logonBackground").style.display = "none";
}

/*document.querySelector("#play-blackjack").addEventListener("click", function () {
    document.querySelector("#play-blackjack").remove();
    blackjack();
    document.getElementById("gameBackground").style.display = "flex";
});*/

function stopButton() {
    document.getElementById("gameBackground").style.display = "none";
}
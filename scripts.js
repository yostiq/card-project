let deck_id = "";

window.onclick = (event) => {
    if (event.target === document.getElementById("logonBackground")) {
        document.getElementById("logonForm").reset();
        document.getElementById("logonBackground").style.display = "none";
    } else if (event.target === document.getElementById("loginBackground")) {
        document.getElementById("loginForm").reset();
        document.getElementById("loginBackground").style.display = "none";
    }
};

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

function showLogScreen(id) {
    document.getElementById(id).style.display = "table";
}

function cancelButton() {
    document.getElementById("loginBackground").style.display = "none";
    document.getElementById("logonBackground").style.display = "none";
}

document.getElementById("drawCard").addEventListener("click", function () {
    getDeck(1)
        .then(() => drawCard(5, "amin"));
});
let poker_deck = "";
let minBet;
let maxBet;
let pokerPlayers;

async function askMinBet() {
    clearPoker();
    minBet = parseInt(prompt("Set minimum bet amount:"));

    if (minBet > await getPlayerMoney()) {
        alert("You don't have enough money for that bet");
        closeGame();
    } else if (!isNaN(minBet) && minBet > 0) {
        console.log("minBet: " + minBet);
        await poker();
    } else {
        closeGame();
    }
}

function setCpuMoney() {
    const multiplier = 10;
    if (minBet * multiplier > 100) {
        for (let i = 1; i < 3; i++) {
            pokerPlayers[i].money = minBet * multiplier;
        }
    }
}

async function getPlayerMoney() {
    let money = 0;
    await db.collection("users").doc(firebase.auth().currentUser.uid).get()
        .then((doc) => {
            money = doc.data().money;
        }).catch((error) => console.log(error));
    return money;
}

async function poker() {
    setCpuMoney();
    if (poker_deck === "") {
        const url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
        await fetch(url)
            .then((response) => response.json())
            .then((json) => poker_deck = json.deck_id)
            .catch((error) => console.log(error));
    } else {
        const url = "https://deckofcardsapi.com/api/deck/" + poker_deck + "/shuffle/";
        await fetch(url)
            .catch((error) => console.log(error));
    }

    for (let i = 0; i < pokerPlayers.length; i++) {
        await pokerDrawCard(5, pokerPlayers[i]);
        await pokerGetHand(pokerPlayers[i]);
    }
}

async function pokerDrawCard(amount, player) {
    let url = "https://deckofcardsapi.com/api/deck/" + poker_deck + "/draw/?count=" + amount;
    if (amount !== 0) {
        await fetch(url)
            .then((response) => response.json())
            .then((json) => pokerAddToHand(json, player))
            .catch((error) => console.log(error));
    }
}

async function pokerAddToHand(json, player) {
    let url = "https://deckofcardsapi.com/api/deck/" + poker_deck + "/pile/" + player.name + "/add/?cards=";
    for (let i = 0; i < json.cards.length; i++) {
        if (json.cards[i].value === "JACK") {
            json.cards[i].value = "11";
        } else if (json.cards[i].value === "QUEEN") {
            json.cards[i].value = "12";
        } else if (json.cards[i].value === "KING") {
            json.cards[i].value = "13";
        } else if (json.cards[i].value === "ACE") {
            json.cards[i].value = "14";
        }

        player.cards.push(json.cards[i]);

        if (i === json.cards.length - 1) {
            url += json.cards[i].code;
        } else {
            url += json.cards[i].code + ",";
        }
    }

    await fetch(url)
        .catch((error) => console.log(error));
}

async function pokerGetHand(player) {
    player.cards.sort((a, b) => b.value - a.value);
    let hand = document.getElementById(player.name + "-hand");
    hand.innerHTML = "";
    for (let i = 0; i < player.cards.length; i++) {
        let img = document.createElement("img");
        if (player.name !== "poker-player") {
            img.src = "img/cards/purple_back.png";
        } else {
            img.src = "img/cards/" + player.cards[i].code + ".png";
            img.className = "playerPokerCard";
        }

        img.alt = player.name + " card" + i;
        hand.appendChild(img);
    }
}

function pokerPlayerTurn() {

}

function clearPoker() {
    minBet = 0;
    maxBet = 0;

    pokerPlayers = [
        {
            name: "poker-player",
            cards: []
        },
        {
            name: "cpu1",
            money: 100,
            cards: []
        },
        {
            name: "cpu2",
            money: 100,
            cards: []
        },
        {
            name: "cpu3",
            money: 100,
            cards: []
        }
    ];
}
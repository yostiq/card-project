let holdem_deck = "";

let holdemPlayers = [
    {
        name: "holdem-player",
        cards: []
    },
    {
        name: "cpu1",
        cards: []
    }, {
        name: "cpu2",
        cards: []
    }, {
        name: "cpu3",
        cards: []
    }
];

async function holdemGetDeck() {
    if (holdem_deck === "") {
        const url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
        await fetch(url)
            .then((response) => response.json())
            .then((json) => holdem_deck = json.deck_id)
            .catch((error) => console.log(error));
    } else {
        const url = "https://deckofcardsapi.com/api/deck/" + holdem_deck + "/shuffle/";
        await fetch(url)
            .catch((error) => console.log(error));
    }

    for (let i = 0; i < holdemPlayers.length; i++) {
        await holdemDrawCard(2, holdemPlayers[i]);
        await holdemGetHand(holdemPlayers[i]);
    }
}

async function holdem() {
    setHoldemCpuMoney();
    await holdemBeginTurn();
}

async function holdemBeginTurn(){
    //clearHoldemTable();

    await holdemGetDeck();
    playersIn = [0, 1, 2, 3];

    for (let i = 0; i < playersIn.length; i++) {
        await holdemSetCardsToTable(holdemPlayers[playersIn[i]]);
    }

}

async function holdemSetCardsToTable(player) {
    player.cards.sort((a, b) => b.value - a.value);
    let hand = document.getElementById(player.name + "-hand");
    console.log(hand);

    for (let i = 0; i < player.cards.length; i++) {
        let img = document.createElement("img");
        if (player.name === "holdem-player") {
            img.src = "img/cards/" + player.cards[i].code + ".png";
        } else {
            img.src = "img/cards/purple_back.png";
        }

        img.alt = player.name + " card" + i;
        hand.appendChild(img);
    }
}

function clearHoldemTable() {
    if (document.getElementsByClassName("overlayText").length !== 0) {
        for (let i = 0; i < document.getElementsByClassName("overlayText").length; i++) {
            document.getElementsByClassName("overlayText")[i].style.display = "none";
        }
    }

    for (let i = 0; i < holdemPlayers.length; i++) {
        holdemPlayers[i].cards = [];
        document.getElementById(holdemPlayers[i].name + "-hand").innerHTML = "";
    }
}

async function askBigBlind() {
    pokerSetButtonActions();
    resetPoker();
    document.getElementById("player-money").innerHTML = await getPlayerMoney();

    bigBlind = parseInt(prompt("Set big blind:"));

    if (bigBlind > await getPlayerMoney()) {
        alert("You don't have enough money for that bet");
        closeGame();
    } else if (!isNaN(bigBlind) && bigBlind > 0) {
        await holdem();
    } else {
        closeGame();
    }
}

function setHoldemCpuMoney() {
    const multiplier = 10;
    for (let i = 1; i < holdemPlayers.length; i++) {
        holdemPlayers[i].money = bigBlind * multiplier;
    }
}

async function holdemDrawCard(amount, player) {
    let url = "https://deckofcardsapi.com/api/deck/" + holdem_deck + "/draw/?count=" + amount;
    if (amount !== 0) {
        await fetch(url)
            .then((response) => response.json())
            .then((json) => pokerAddToHand(json, player))
            .catch((error) => console.log(error));
    }
}

async function holdemAddToHand(json, player) {
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

async function holdemGetHand(player) {
    player.cards.sort((a, b) => b.value - a.value);
    console.log(player.cards);
    //console.log(solve(player.cards));
}
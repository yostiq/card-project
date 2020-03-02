let holdem_deck = "";
let bigBlind;
let smallBlind;
let currentMinCall;
let currentMinRaise
let dealer;
let holdemPlayersIn;
let holdemPot;
let holdemPlayers;

async function askBigBlind() {
    resetHoldem();
    holdemSetButtonActions();
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

async function holdem() {
    holdemSetCpuMoney();
    await holdemGetDeck();
    await holdemBeginTurn();
}

function holdemSetCpuMoney() {
    const multiplier = 20;
    for (let i = 1; i < holdemPlayers.length; i++) {
        holdemPlayers[i].money = bigBlind * multiplier;
    }
}


async function holdemBeginTurn(){
    clearHoldemTable();

    for (let i = 0; i < holdemPlayersIn.length; i++) { //rahojen tarkistus
        if (holdemPlayers[i].money < bigBlind) {
            holdemPlayersIn[i].delete();
            console.log(playersIn[i]);
        }
    }

    for (let i = 0; i < holdemPlayersIn.length; i++) {    //korttien jako
        await holdemSetCardsToTable(holdemPlayers[holdemPlayersIn[i]]);
        console.log(holdemPlayers[i].cards.length);
    }

    /*for (let i = dealer; i < playersIn.length; i++) { //blindien maksu

    }*/

}

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

async function holdemSetCardsToTable(player) {
    holdemPlayer.cards.sort((a, b) => b.value - a.value); //player to holdemPlayer? rivi 153?
    let hand = document.getElementById(player.name + "-hand");

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

async function holdemDrawCard(amount, player) {
    let url = "https://deckofcardsapi.com/api/deck/" + holdem_deck + "/draw/?count=" + amount;
    if (amount !== 0) {
        await fetch(url)
            .then((response) => response.json())
            .then((json) => holdemAddToHand(json, player))
            .catch((error) => console.log(error));
    }
}

function holdemAddToHand(json, player) {
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
    }
}

async function holdemGetHand(player) {
    player.cards.sort((a, b) => b.value - a.value);
    console.log(player.cards);
}

function holdemSetButtonActions() {
    const holdemPlayerIndex = () => {
        for (let i = 0; i < holdemPlayersIn.length; i++){
            if(holdemPlayers[holdemPlayersIn[i]].name === "holdem-player"){
                return i;
            }
        }
    };
    const player = holdemPlayers[holdemPlayersIn[holdemPlayerIndex()]];

    document.getElementById("CHECK-button").addEventListener("click", () => {
        playerBetTurn = false;
        player.checkCall = true;
        currentPlayerIndex++;
        if (currentPlayerIndex === playersIn.length) {
            currentPlayerIndex = 0;
        }
        pokerHideAllButtons();
        pokerTurn().catch(error => console.log(error));
    });
    document.getElementById("call-button").addEventListener("click", () => {
        playerBetTurn = false;
        player.checkCall = true;
        currentPlayerIndex++;
        if (currentPlayerIndex === playersIn.length) {
            currentPlayerIndex = 0;
        }
        pokerPlayerPay(player, currentBet).catch(error => console.log(error));
        pokerTurn().catch(error => console.log(error));
    });
    document.getElementById("bet-button").addEventListener("click", () => {
        playerBetTurn = false;
        player.checkCall = true;

        pokerHideAllButtons();
        pokerTurn().catch(error => console.log(error));
    });
    document.getElementById("raise-button").addEventListener("click", () => {
        document.getElementById("minus-button").style.display = "block";
        document.getElementById("plus-button").style.display = "block";
    });
    document.getElementById("all-in-button").addEventListener("click", () => {
        playerBetTurn = false;
        player.checkCall = true;
        pokerHideAllButtons();

        pokerTurn().catch(error => console.log(error));
    });
    document.getElementById("fold-button").addEventListener("click", () => {
        playerBetTurn = false;
        player.fold = true;
        playersIn.splice(playersIn.indexOf(playersIn[playerIndex()]), 1);
        pokerHideAllButtons();
        setOverlayText(player, "FOLD");
        pokerTurn().catch(error => console.log(error));
    });
    document.getElementById("draw-button").addEventListener("click", () => {
        pokerHideAllButtons();
        //TODO draw button
    });
    document.getElementById("stay-button").addEventListener("click", () => {
        pokerHideAllButtons();
        //TODO stay button
    });
    document.getElementById("minus-button").addEventListener("click", () => {
        //TODO minus button
    });
    document.getElementById("plus-button").addEventListener("click", () => {
        //TODO plus button
    });
}

function resetHoldem() {
    bigBlind = 0;
    smallBlind = 0;
    currentMinCall = 0;
    currentMinRaise = 0;
    dealer = 0;
    holdemPlayersIn = [0, 1, 2, 3];
    holdemPot = 0;

    holdemPlayers = [
        {
            name: "holdem-player",
            nickname: "Player",
            order: 0,
            checkCall: false,
            fold: false,
            out: false,
            cards: []
        },
        {
            name: "cpu1",
            nickname: "Joonas",
            order: 1,
            checkCall: false,
            fold: false,
            out: false,
            risk: 20,
            money: 100,
            cards: []
        },
        {
            name: "cpu2",
            nickname: "Amin",
            order: 2,
            checkCall: false,
            fold: false,
            out: false,
            risk: 50,
            money: 100,
            cards: []
        },
        {
            name: "cpu3",
            nickname: "Joni",
            order: 3,
            checkCall: false,
            fold: false,
            out: false,
            risk: 80,
            money: 100,
            cards: []
        }
    ];
}
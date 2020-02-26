let poker_deck = "";
let minBet;
let currentBet;
let maxBet;
let pokerPlayers;
let playersIn;
let pokerPot;

async function askMinBet() {
    clearPoker();
    minBet = parseInt(prompt("Set minimum bet amount:"));

    if (minBet > await getPlayerMoney()) {
        alert("You don't have enough money for that bet");
        closeGame();
    } else if (!isNaN(minBet) && minBet > 0) {
        await poker();
    } else {
        closeGame();
    }
}

async function setMaxBet() {
    for (let i = 0; i < pokerPlayers.length; i++) {
        if (pokerPlayers[i].money < maxBet && !pokerPlayers[i].out) {
            if (pokerPlayers[i].name === "poker-player") {
                maxBet = await getPlayerMoney();
            } else {
                maxBet = pokerPlayers[i].money;
            }
        }
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

async function pokerPlayerWinMoney(amount) {
    await db.collection("users").doc(firebase.auth().currentUser.uid)
        .update("money", firebase.firestore.FieldValue.increment(amount * 1))
        .catch(error => console.log(error));
}

async function pokerPlayerLoseMoney(amount) {
    if (parseInt(amount) > 0) {
        await db.collection("users").doc(firebase.auth().currentUser.uid)
            .update("money", firebase.firestore.FieldValue.increment(amount * -1))
            .catch(error => console.log(error));
    }
}

async function pokerGetDeck(){
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
}

async function poker() {
    setCpuMoney();
    await pokerBeginTurn();
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

function pokerAddToHand(json, player) {
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

async function pokerGetHand(player) {
    player.cards.sort((a, b) => b.value - a.value);
    let hand = document.getElementById(player.name + "-hand");

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

async function pokerBeginTurn() {
    clearTable();
    await pokerGetDeck();

    pokerPlayers.sort((a, b) => a.order - b.order);
    playersIn = [0, 1, 2, 3];

    for (let i = 0; i < pokerPlayers.length; i++) {
        if (pokerPlayers[i].out) {
            setOverlayText(pokerPlayers[i], "OUT");
            playersIn.splice(playersIn.indexOf(i), 1);
        }
    }

    for (let i = 0; i < playersIn.length; i++) {
        await pokerPlayerPay(pokerPlayers[playersIn[i]], minBet);
        pokerPot += minBet;
        await pokerDrawCard(5, pokerPlayers[i]);
        await pokerGetHand(pokerPlayers[i]);
    }

    await playPoker();

    pokerSetPlayerOrder();
}

async function playPoker() {
    let gameOver = false;

    for (let i = 0; i < pokerPlayers.length; i++) {
        pokerPlayers[i].fold = false;

        if (pokerPlayers[i].out) {
            setOverlayText(pokerPlayers[i], "OUT");
            playersIn.splice(playersIn.indexOf(i), 1);
        }
    }

    let i = 0;
    while (!gameOver) {
        if (playersIn.length === 1) {
            gameOver = true;
        } else {
            await setMaxBet();

            let currentPlayer = pokerPlayers[playersIn[i]];

            if (currentPlayer.name === "poker-player") {
                await pokerPlayerTurn();
            } else {
                await pokerAiTurn(currentPlayer);
            }

            if (currentPlayer.fold) {
                playersIn.splice(playersIn.indexOf(playersIn[i]), 1);
                i--;
            }

            i++;
            if (i === playersIn.length) {
                i = 0;
            }
        }
    }
    alert("Winner is: " + pokerPlayers[playersIn[0]].name);
}

function pokerPlayerTurn() {
    //TODO show check, call, raise and fold buttons
    alert("Players turn");
}

function pokerAiTurn(cpu) {
    let risk = cpu.risk / 100;

    if (cpu.out || cpu.fold) {
        return false;
    }

    if (Math.random() > risk) { /*ai fold*/
        cpu.fold = true;

        setOverlayText(cpu, "FOLD");
    } else {
        if (Math.random() > risk) {
            //TODO ai check/call
        } else {
            //TODO ai raise
        }
    }

    return true;
}

async function pokerPlayerPay(player, amount) {
    if (player.name === "poker-player") {
        await pokerPlayerLoseMoney(amount);
    } else {
        player.money -= parseInt(amount);
    }

    pokerPot += parseInt(amount)
}

async function pokerRaise(player, amount) {
    await pokerPlayerPay(player, amount);
    currentBet = currentBet + amount;
}

function pokerSetPlayerOrder() {
    for (let i = 0; i < pokerPlayers.length; i++) {
        pokerPlayers[i].order += 1;
        if (pokerPlayers[i].order === 4) {
            pokerPlayers[i].order = 0;
        }
    }
    pokerPlayers.sort((a, b) => a.order - b.order);
}

function setOverlayText(player, text) {
    document.getElementById(player.name + "-hand").style.position = "relative";

    let overlay = document.createElement("p");
    overlay.innerHTML = text;
    overlay.className = "overlayText";
    overlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    overlay.style.paddingTop = "10%";
    overlay.style.position = "absolute";
    overlay.style.top = "50%";
    overlay.style.left = "50%";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.textAlign = "center";
    overlay.style.transform = "translate(-50%, -50%)";

    let element = document.getElementById(player.name + "-hand");
    element.appendChild(overlay);
}

function clearTable() {
    if (document.getElementsByClassName("overlayText").length !== 0) {
        for (let i = 0; i < document.getElementsByClassName("overlayText").length; i++) {
            document.getElementsByClassName("overlayText")[i].style.display = "none";
        }
    }

    for(let i = 0; i < pokerPlayers.length; i++){
        pokerPlayers[i].cards = [];
        document.getElementById(pokerPlayers[i].name + "-hand").innerHTML = "";
    }
}

function clearPoker() {
    playersIn = [0, 1, 2, 3];
    minBet = 0;
    currentBet = 0;
    maxBet = 99999;
    pokerPot = 0;

    pokerPlayers = [
        {
            name: "poker-player",
            order: 0,
            fold: false,
            out: false,
            cards: []
        },
        {
            name: "cpu1", /*Joonas*/
            order: 1,
            fold: false,
            out: false,
            risk: 20,
            money: 100,
            cards: []
        },
        {
            name: "cpu2", /*Amin*/
            order: 2,
            fold: false,
            out: false,
            risk: 50,
            money: 100,
            cards: []
        },
        {
            name: "cpu3", /*Joni*/
            order: 3,
            fold: false,
            out: false,
            risk: 80,
            money: 100,
            cards: []
        }
    ];
}
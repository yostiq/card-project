let poker_deck = "";
let minBet;
let maxBet;
let currentBet;
let pokerPlayers;
let playersIn;
let pokerPot;
let round;

const api_server = "http://joy.karaoui.fi:8000/api/deck/";

async function askMinBet() {
    pokerHideAllButtons();
    pokerSetButtonActions();
    resetPoker();
    document.getElementById("player-money").innerHTML = await getPlayerMoney();

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
    for (let i = 0; i < playersIn.length; i++) {
        if (pokerPlayers[playersIn[i]].money < maxBet) {
            if (pokerPlayers[playersIn[i]].name === "poker-player") {
                maxBet = await getPlayerMoney();
            } else {
                maxBet = pokerPlayers[playersIn[i]].money;
            }
        }
    }
}

function setCpuMoney() {
    const multiplier = 10;
    for (let i = 1; i < pokerPlayers.length; i++) {
        pokerPlayers[i].money = minBet * multiplier;
    }
}

async function getPlayerMoney() {
    let money = 0;
    await db.collection("users").doc(firebase.auth().currentUser.uid).get()
        .then(doc => money = doc.data().money)
        .catch(error => console.log(error));
    return money;
}

async function pokerVictoryRoyale(player, amount) {
    if (player.name === "poker-player") {
        await db.collection("users").doc(firebase.auth().currentUser.uid)
            .update("money", firebase.firestore.FieldValue.increment(amount * 1))
            .catch(error => console.log(error));
    } else {
        player.money += parseInt(amount);
    }

    alert("Winner is: " + player.nickname + "\nWin amount: " + pokerPot);
    pokerPot = 0;
}

async function pokerPlayerLoseMoney(amount) {
    if (parseInt(amount) > 0) {
        await db.collection("users").doc(firebase.auth().currentUser.uid)
            .update("money", firebase.firestore.FieldValue.increment(amount * -1))
            .catch(error => console.log(error));
    }
}

async function pokerGetDeck() {
    if (poker_deck === "") {
        const url = api_server + "new/shuffle/?deck_count=1";
        await fetch(url)
            .then(response => response.json())
            .then(json => poker_deck = json.deck_id)
            .catch(error => console.log(error));
    } else {
        const url = api_server + poker_deck + "/shuffle/";
        await fetch(url)
            .catch(error => console.log(error));
    }
}

async function poker() {
    setCpuMoney();
    await pokerBeginTurn();
}

async function pokerDrawCard(amount, player) {
    const url = api_server + poker_deck + "/draw/?count=" + amount;
    if (amount !== 0) {
        await fetch(url)
            .then(response => response.json())
            .then(json => pokerAddToHand(json, player))
            .catch(error => console.log(error));
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

async function pokerSetCardsToTable(player) {
    player.cards.sort((a, b) => b.value - a.value);
    let hand = document.getElementById(player.name + "-hand");

    for (let i = 0; i < player.cards.length; i++) {
        let img = document.createElement("img");
        if (player.name === "poker-player") {
            img.src = "img/cards/" + player.cards[i].code + ".png";
        } else {
            img.src = "img/cards/purple_back.png";
        }

        img.alt = player.name + " card" + i;
        hand.appendChild(img);
    }
}

async function pokerKickPoorPlayers() {
    for (let i = 0; i < pokerPlayers.length; i++) {
        if (pokerPlayers[i].name === "poker-player") {
            if (await getPlayerMoney() < minBet) {
                alert("You don't have enough money to keep playing. Please leave");
                closeGame();
                return true;
            }
        } else {
            if (pokerPlayers[i].money < minBet) {
                pokerPlayers[i].out = true;
            }
        }
    }
    return false;
}

async function pokerBeginTurn() {
    clearTable();

    if (await pokerKickPoorPlayers()) {
        return;
    }

    await pokerGetDeck();
    playersIn = [0, 1, 2, 3];

    for (let i = 0; i < pokerPlayers.length; i++) {
        if (pokerPlayers[i].out) {
            setOverlayText(pokerPlayers[i], "OUT");
            playersIn.splice(playersIn.indexOf(i), 1);
        }
        if (pokerPlayers[i].name !== "poker-player") {
            //TODO document.getElementById(pokerPlayers[i].name + "-money").innerHTML = String(pokerPlayers[i].money);
        }
    }

    for (let i = 0; i < playersIn.length; i++) {
        await pokerPlayerPay(pokerPlayers[playersIn[i]], minBet);
        await pokerDrawCard(5, pokerPlayers[playersIn[i]]);
        await pokerSetCardsToTable(pokerPlayers[playersIn[i]]);
    }

    currentBet = 0;

    await playPoker();

    if (await getPlayerMoney() >= minBet) {
        if (confirm("Do you want to keep playing?")) {
            await pokerSetPlayerOrder();
            await pokerBeginTurn();
        } else {
            closeGame();
        }
    } else {
        alert("You don't have enough money to keep playing. Please leave.");
        closeGame();
    }
}

async function playPoker() {
    playersIn = [0, 1, 2, 3];

    for (let i = 0; i < pokerPlayers.length; i++) {
        pokerPlayers[i].fold = false;

        if (pokerPlayers[i].out) {
            setOverlayText(pokerPlayers[i], "OUT");
            playersIn.splice(playersIn.indexOf(i), 1);
        }
    }


    let drawed = 0;
    let round = 1;
    let i = 0;
    while (true) {
        if (playersIn.length === 1) {
            break;
        }

        let currentPlayer = pokerPlayers[playersIn[i]];
        let checked = 0;
        for (let j = 0; j < playersIn.length; j++) {
            if (pokerPlayers[playersIn[j]].checkCall) {
                checked++;
            }
        }

        if (checked === playersIn.length && round === 2) {
            break;
        }

        /* Draw round */
        if (checked === playersIn.length && round === 1 && drawed !== playersIn.length) {
            if (currentPlayer.name === "poker-player") {
                await pokerPlayerDrawTurn();
            } else {
                await aiSolveDraw(currentPlayer.cards);
                await pokerAiActionText(currentPlayer, "Drawing...");
            }

            drawed++;
            if (drawed === playersIn.length) {
                round++;
                await clearCheckCall();
            }
        } else {
            await setMaxBet();

            if (currentPlayer.name === "poker-player") {
                await pokerPlayerMoneyTurn();
            } else {
                await pokerAiMoneyTurn(currentPlayer);
            }

            if (currentPlayer.fold) {
                playersIn.splice(playersIn.indexOf(playersIn[i]), 1);
                i--;
            }
        }

        i++;
        if (i === playersIn.length) {
            i = 0;
        }
    }

    if (playersIn.length === 1) {
        await pokerVictoryRoyale(pokerPlayers[playersIn[0]], pokerPot);
    } else {
        alert("Solve cards to find winner.");
    }
}

function pokerPlayerDrawTurn() {
    //TODO wait user action

    pokerShowDrawButtons();

    alert("Players turn");
    if (confirm("Draw?")) {

    } else {

    }

    pokerHideAllButtons();
}

function pokerPlayerMoneyTurn() {
    let player;
    for (let i = 0; i < playersIn.length; i++) {
        if (pokerPlayers[playersIn[i]].name === "poker-player") {
            player = pokerPlayers[playersIn[i]];
        }
    }

    //TODO wait user action

    pokerShowMoneyTurnButtons();

    alert("Players turn");
    if (confirm("Fold?")) {
        player.fold = true;
        setOverlayText(player, "FOLD");
    } else {

    }

    pokerHideAllButtons();
}

async function pokerAiMoneyTurn(cpu) {
    if (cpu.out || cpu.fold) {
        return;
    }

    let risk = cpu.risk / 100;

    setOverlayText(cpu, "Thinking...");
    await sleep(1000);
    clearPlayerOverlayText(cpu);

    if (Math.random() > risk) { /*ai fold*/
        cpu.fold = true;
        setOverlayText(cpu, "FOLD");
    } else {
        if (cpu.money === currentBet || Math.random() > 0.3 || currentBet >= maxBet) {
            if (currentBet === 0) {
                await pokerAiActionText(cpu, "Check");
                console.log(cpu.name + " check");
            } else {
                await pokerPlayerPay(cpu, currentBet);
                await pokerAiActionText(cpu, "Call");
                console.log(cpu.name + " call: " + currentBet);
            }
            cpu.checkCall = true;
        } else {
            if(Math.random() > 0.1 && maxBet === cpu.money){
                await pokerAiActionText(cpu, "All-in");
                await pokerPlayerPay(cpu, maxBet);
                await clearCheckCall();
                cpu.checkCall = true;
                console.log(cpu.name + " all-in: " + maxBet);
            } else {
                await pokerAiActionText(cpu, "Raise");
                let amount = currentBet + Math.floor((maxBet - minBet) * Math.random());
                await pokerPlayerPay(cpu, amount);
                await clearCheckCall();
                cpu.checkCall = true;
                console.log(cpu.name + " raise: " + amount);
            }
        }
    }
}

async function pokerPlayerPay(player, amount) {
    if (player.name === "poker-player") {
        await pokerPlayerLoseMoney(amount);
        document.getElementById("player-money").innerHTML = await getPlayerMoney();
    } else {
        player.money -= parseInt(amount);
        document.getElementById(player.name + "-bet").innerHTML = amount;
        //TODO document.getElementById(player.name + "-money").innerHTML = player.money;
    }
    currentBet = amount;
    pokerPot += parseInt(amount);
    document.getElementById("pot-amount").innerHTML = "Pot: " + pokerPot;
}

async function pokerSetPlayerOrder() {
    for (let i = 0; i < pokerPlayers.length; i++) {
        pokerPlayers[i].order--;
        if (pokerPlayers[i].order === -1) {
            pokerPlayers[i].order = 3;
        }
    }
    pokerPlayers.sort((a, b) => a.order - b.order);
}

function pokerShowMoneyTurnButtons() {
    if(currentBet === 0){
        document.getElementById("CHECK-button").style.display = "block";
    } else {
        document.getElementById("call-button").style.display = "block";
    }
    document.getElementById("raise-button").style.display = "block";
    document.getElementById("fold-button").style.display = "block";
}

function pokerShowDrawButtons() {
    document.getElementById("draw-button").style.display = "block";
    document.getElementById("stay-button").style.display = "block";
}

function pokerHideAllButtons() {
    document.getElementById("minus-button").style.display = "none";
    document.getElementById("plus-button").style.display = "none";
    document.getElementById("CHECK-button").style.display = "none";
    document.getElementById("call-button").style.display = "none";
    document.getElementById("bet-button").style.display = "none";
    document.getElementById("raise-button").style.display = "none";
    document.getElementById("all-in-button").style.display = "none";
    document.getElementById("fold-button").style.display = "none";

    document.getElementById("draw-button").style.display = "none";
    document.getElementById("stay-button").style.display = "none";
}

function pokerSetButtonActions() {
    document.getElementById("CHECK-button").addEventListener("click", () => {
        //TODO check button
    });
    document.getElementById("call-button").addEventListener("click", () => {
        //TODO call button
    });
    document.getElementById("bet-button").addEventListener("click", () => {
        //TODO bet button
    });
    document.getElementById("raise-button").addEventListener("click", () => {
        //TODO raise button
    });
    document.getElementById("all-in-button").addEventListener("click", () => {
        //TODO all-in button
    });
    document.getElementById("fold-button").addEventListener("click", () => {
        //TODO fold button
    });
    document.getElementById("draw-button").addEventListener("click", () => {
        //TODO draw button
    });
    document.getElementById("stay-button").addEventListener("click", () => {
        //TODO stay button
    });
    document.getElementById("minus-button").addEventListener("click", () => {
        //TODO minus button
    });
    document.getElementById("plus-button").addEventListener("click", () => {
        //TODO plus button
    });
}

function setOverlayText(player, text) {
    document.getElementById(player.name + "-hand").style.position = "relative";

    let overlay = document.createElement("p");
    overlay.innerHTML = text;
    overlay.className = "overlayText";
    overlay.id = player.name + "OverlayText";

    if (text === "Thinking...") {
        overlay.style.backgroundColor = "rgba(0,0,255,0.5)";
    } else if (text === "FOLD" || text === "OUT") {
        overlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    } else {
        overlay.style.backgroundColor = "rgba(255,255,0,0.5)";
    }

    overlay.style.position = "absolute";
    overlay.style.top = "50%";
    overlay.style.left = "50%";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.transform = "translate(-50%, -50%)";

    let element = document.getElementById(player.name + "-hand");
    element.appendChild(overlay);
}

function clearPlayerOverlayText(player) {
    let element = document.getElementById(player.name + "OverlayText");
    element.parentNode.removeChild(element);
}

async function pokerAiActionText(cpu, text) {
    setOverlayText(cpu, text);
    await sleep(750);
    clearPlayerOverlayText(cpu);
}

function clearTable() {
    if (document.getElementsByClassName("overlayText").length !== 0) {
        for (let i = 0; i < document.getElementsByClassName("overlayText").length; i++) {
            document.getElementsByClassName("overlayText")[i].style.display = "none";
        }
    }

    for (let i = 0; i < pokerPlayers.length; i++) {
        pokerPlayers[i].cards = [];
        document.getElementById(pokerPlayers[i].name + "-hand").innerHTML = "";
    }
}

async function clearCheckCall() {
    for (let i = 0; i < playersIn.length; i++) {
        pokerPlayers[playersIn[i]].checkCall = false;
    }
}

function resetPoker() {
    playersIn = [0, 1, 2, 3];
    minBet = 0;
    currentBet = 0;
    maxBet = 99999;
    pokerPot = 0;
    round = 0;

    pokerPlayers = [
        {
            name: "poker-player",
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
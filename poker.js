let poker_deck = "";

let pokerPlayers = [
    {
        name: "player",
        cards: []
    },
    {
        name: "joonas",
        cards: []
    }, {
        name: "amin",
        cards: []
    }, {
        name: "joni",
        cards: []
    }
];

async function poker() {
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
    console.log(player.cards);
    console.log(solve(player.cards));
}

document.querySelector("#openPoker").addEventListener("click", async function () {
    await poker();
});
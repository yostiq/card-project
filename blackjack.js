let deck_id = "";

async function blackjack() {
    const DECKAMOUNT = 1;
    let url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=" + DECKAMOUNT;
    await fetch(url)
        .then((response) => response.json())
        .then((json) => {
            deck_id = json.deck_id;
        })
        .catch((error) => console.log(error));

    await drawCard(2, "player");
    await drawCard(2, "house");

    let pH = document.createElement("p");
    pH.append(document.createTextNode("House"));
    document.querySelector("#house-hand").appendChild(pH);
    let pP = document.createElement("p");
    pP.append(document.createTextNode("Player"));
    document.querySelector("#player-hand").appendChild(pP);

    await getHand("player");
    await getHand("house");



}

async function drawCard(amount, player) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=" + amount;

    await fetch(url)
        .then((response) => response.json())
        .then((json) => addToHand(json, player))
        .catch((error) => console.log(error))
}

async function addToHand(json, player) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + player + "/add/?cards=";
    for (let i = 0; i < json.cards.length; i++) {
        if (json.cards[i].value === "JACK" || json.cards[i].value === "QUEEN" || json.cards[i].value === "KING") {
        } else {
        }

        if (i === json.cards.length - 1) {
            url += json.cards[i].code;
        } else {
            url += json.cards[i].code + ",";
        }
    }
    fetch(url)
        .then((response) => {
            if (response.status !== 200) {
                window.alert(response)
            }
        }).catch((error) => console.log(error))
}

async function getHand(player) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + player + "/list/";
    await fetch(url)
        .then(function (response) {
            response.json()
                .then(function (json) {
                    let cards;
                    let element;
                    if (player === "player") {
                        cards = json.piles.player.cards;
                        element = document.querySelector("#player-hand");
                    } else if (player === "house" ) {
                        cards = json.piles.house.cards;
                        element = document.querySelector("#house-hand");
                    }
                    console.log(cards);
                    for (let i = 0; i < cards.length; i++) {
                        if (i === 0 && player === "house") {
                            let img = document.createElement("img");
                            // img.src = "https://www.hearthstonetopdecks.com/wp-content/uploads/2018/02/card-back-frostfire-200x300.png";
                            img.src = "cards/purple_back.png";
                            img.className = "card";
                            element.appendChild(img);
                        } else {
                            let img = document.createElement("img");
                            let imgCode = "cards/" + cards[i].code + ".png";
                            // img.src = cards[i].image;
                            img.src = imgCode;
                            img.className = "card";
                            element.appendChild(img);
                        }
                    }

                })
        });
}
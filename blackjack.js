let deck_id = "";
let player = {
    name: "player",
    points: 0,
    cards: []
};
let house = {
    name: "house",
    points: 0,
    cards: []
};

async function blackjack() {
    const DECKAMOUNT = 1;
    //New deck let url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=" + DECKAMOUNT;
    let url = "https://deckofcardsapi.com/api/deck/dkajikxjivr7/shuffle/";
    await fetch(url)
        .then((response) => response.json())
        .then((json) => {
            deck_id = json.deck_id;
        })
        .catch((error) => console.log(error));

    await drawCard(2, player);
    await drawCard(2, house);

    startUI();

    await getHand(player);
    await getHand(house);

    console.log(deck_id);

}

async function drawCard(amount, player) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=" + amount;

    await fetch(url)
        .then((response) => response.json())
        .then((json) => addToHand(json, player))
        .catch((error) => console.log(error))
}

async function addToHand(json, player) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + player.name + "/add/?cards=";
    for (let i = 0; i < json.cards.length; i++) {
        player.cards.push(json.cards[i]);
        if (json.cards[i].value === "JACK" || json.cards[i].value === "QUEEN" || json.cards[i].value === "KING") {
            if (player.name === "house" && i === 0) {
                player.points += 0;
            } else {
                player.points += 10;
            }
        } else if (json.cards[i].value === "ACE") {
            if (player.name === "house" && i === 0) {
                player.points += 0;
            } else {
                player.points += 1;
            }
        } else {
            if (player.name === "house" && i === 0) {
                player.points += 0;
            } else {
                player.points += parseInt(json.cards[i].value);
            }
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
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + player.name + "/list/";
    await fetch(url)
        .then(function (response) {
            response.json()
                .then(function () {
                    let cards;
                    let element;
                    if (player.name === "player") {
                        cards = player.cards;
                        element = document.querySelector("#player-hand");
                    } else if (player.name === "house") {
                        cards = house.cards;
                        element = document.querySelector("#house-hand");
                    }
                    for (let i = 0; i < cards.length; i++) {
                        if (i === 0 && player.name === "house") {
                            let img = document.createElement("img");
                            img.src = "cards/purple_back.png";
                            img.className = "card";
                            element.appendChild(img);
                        } else {
                            console.log(i);
                            let img = document.createElement("img");
                            let imgCode = "cards/" + cards[i].code + ".png";
                            img.src = imgCode;
                            img.className = "card";
                            element.appendChild(img);
                        }
                    }

                })
        });
}

function startUI() {
    /*let pH = document.createElement("p");
    pH.id = "pH";
    pH.append(document.createTextNode("House " + house.points));
    document.querySelector("#house").appendChild(pH);
    let pP = document.createElement("p");
    pP.id = "pP";
    pP.append(document.createTextNode("Player " + player.points));
    document.querySelector("#player").appendChild(pP);*/

    let hitButton = document.createElement("button");
    hitButton.innerText = "HIT";
    hitButton.addEventListener("click", () => hit());

    let stayButton = document.createElement("button");
    stayButton.innerText = "STAY";
    stayButton.addEventListener("click", () => stay());

    document.querySelector("#blackjack-buttons").appendChild(hitButton);
    document.querySelector("#blackjack-buttons").appendChild(stayButton);
}

async function updateUI() {
    // let p = document.getElementById("pP");
    // p.innerText = "vittu";
}

async function hit() {
    await drawCard(1, player);
    let p = document.getElementById("player");
    p.innerText = "Player: " + player.points;
    document.querySelector("#player-hand").innerHTML = "";
    document.querySelector("#player").appendChild(p);
    await getHand(player);
    await updateUI();
}

function stay() {

}



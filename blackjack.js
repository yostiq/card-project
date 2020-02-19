let mCards = []
let mPlayer = {
    name: "player",
    cards: [],
    points: {
        ace1: 0,
        ace10: 0,
        final: 0
    }
}
let mHouse = {
    name: "house",
    cards: [],
    points: {
        ace1: 0,
        ace10: 0,
        hiddenAce1: 0,
        hiddenAce10: 0,
        final: 0
    }
}

document.querySelector("#openBlackjack").addEventListener("click",() => {
    document.getElementById("gameBackground").style.display = "flex"
    document.querySelector("#play-button").setAttribute("class", "")
})
document.querySelector("#play-button").addEventListener("click", () => {
    playBlackjack()
    document.querySelector("#play-button").setAttribute("class", "hidden")
})
document.querySelector("#reset-button").addEventListener("click", () => {
    resetBlackjack()
    playBlackjack()
    document.querySelector("#reset-button").setAttribute("class", "hidden")
})
document.querySelector("#stop").addEventListener("click", () => {
    document.getElementById("gameBackground").style.display = "none"
    resetBlackjack()
})

function playBlackjack() {
    new Promise(resolve => {
        //New deck let url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=" + DECKAMOUNT
        let url = "https://deckofcardsapi.com/api/deck/dkajikxjivr7/shuffle/"
        fetch(url)
            .then(response => response.json())
            .then(json => {
                resolve(json.deck_id)
            })
            .catch(error => console.log(error))
    }).then(deck_id => {
        return new Promise(resolve => {
            let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=52"
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    resolve(json)
                })
                .catch(error => console.log(error))
        })
    }).then(json => {
        for (let i = 0; i < json.cards.length; i++) {
            mCards[i] = json.cards[i]
        }
        addToHand(mPlayer, 2)
        addToHand(mHouse, 2)
        updateTableCards(mPlayer, false)
        updateTableCards(mHouse, false)
        updatePoints(false)
        document.querySelector("#hit-button").addEventListener("click", hit)
        document.querySelector("#stay-button").addEventListener("click", stay)
    })
}

function addToHand(player, numberOfCards) {
    for (let i = 0; i < numberOfCards; i++) {
        //Set points for player
        let card = mCards.pop()
        if (checkPoints(card) !== "ACE") {
            player.points.ace10 += checkPoints(card)
            player.points.ace1 += checkPoints(card)
            player.points.final += checkPoints(card)
            if (i > 0 && player.name === "house")
                player.points.hiddenAce10 += checkPoints(card)
            player.points.hiddenAce1 += checkPoints(card)
        }
        else {
            player.points.ace1 += 1
            player.points.ace10 += 10
            if (i > 0 && player.name === "house") {
                player.points.hiddenAce1 += 1
                player.points.hiddenAce10 += 10
            }
        }
        player.cards.push(card)
    }
}

function checkPoints(card) {
    //Returns value of card unless ace, then returns ace as string
    if (card.value === "JACK" || card.value === "QUEEN" || card.value === "KING") {
        return 10
    } else if (card.value === "ACE") {
        return "ACE"
    } else {
        return parseInt(card.value)
    }
}

function updateTableCards(player, houseTurn) {
    let id
    if (player.name === "player") {
        id = "#player-hand"
    } else {
        id = "#house-hand"
    }

    let handElement = document.querySelector(id)
    handElement.innerText = ""
    for (let i = 0; i < player.cards.length; i++) {
        let img = document.createElement("img")
        img.className = "card"
        if (i === 0 && player.name === "house" && !houseTurn) {
            img.src = "cards/purple_back.png"
        } else {
            img.src = "cards/" + player.cards[i].code + ".png"
        }
        handElement.appendChild(img)
    }
}

function updatePoints(isHouseTurn) {
    //Set points on the table, if ace is in play both possibilities shown
    let playerPoints = document.querySelector("#player-points")
    let housePoints = document.querySelector("#house-points")
    if (isAceInHand(mPlayer)) {
        playerPoints.innerText = mPlayer.points.ace1 + " / " + mPlayer.points.ace10
    } else {
        playerPoints.innerText = mPlayer.points.ace10
    }

    if (!isHouseTurn) {
        if (isAceInHand(mHouse)) {
            housePoints.innerText = mHouse.points.hiddenAce1 + " / " + mHouse.points.hiddenAce10
        } else {
            housePoints.innerText = mHouse.points.hiddenAce10
        }
    } else {
        if (isAceInHand(mHouse)) {
            housePoints.innerText = mHouse.points.ace1 + " / " + mHouse.points.ace10
        } else {
            housePoints.innerText = mHouse.points.ace10
        }
    }
}

function isAceInHand(player) {
    //Checks whether an ace is in a player's hand
    for (let i = 0; i < player.cards.length; i++) {
        let card = player.cards[i]
        if (card.value === "ACE") {
            if (player.cards.length === 2 && i === 0 && player.name === "house") {

            } else {
                return true
            }
        }
    }
    return false
}

function resetBlackjack() {
    mCards = []
    mPlayer = {
        name: "player",
        cards: [],
        points: {
            ace1: 0,
            ace10: 0,
            final: 0
        }
    }
    mHouse = {
        name: "house",
        cards: [],
        points: {
            ace1: 0,
            ace10: 0,
            hiddenAce1: 0,
            hiddenAce10: 0,
            final: 0
        }
    }
    document.querySelector("#player-hand").innerText = ""
    document.querySelector("#house-hand").innerText = ""
    updatePoints(false)
}

function hit() {
    let promise = new Promise(resolve => {
        addToHand(mPlayer, 1)
        updateTableCards(mPlayer, false)
        updatePoints(false)
        setTimeout(resolve, 100)
    })

    promise.then(() => {
        if (mPlayer.points.ace1 > 21) {
            console.log("lost")
            document.querySelector("#hit-button").removeEventListener("click", hit)
            document.querySelector("#stay-button").removeEventListener("click", stay)
            document.querySelector("#reset-button").setAttribute("class", "")
        }
    })
    let amount = document.querySelector("#bet-amount").value
    console.log(amount)
}

function stay() {
    updateTableCards(mHouse, true)
    updatePoints(true)

    while (mHouse.points.ace1 < 17 || mHouse.points.ace10 < 17 && mHouse.points.ace1 < mPlayer.points.ace1) {
        addToHand(mHouse, 1)
        updateTableCards(mHouse, true)
        updatePoints(true)
    }

    if (mPlayer.points.ace10 > 21) {
        mPlayer.points.final = mPlayer.points.ace1;
    } else {
        mPlayer.points.final = mPlayer.points.ace10;
    }

    if (mHouse.points.ace10 > 21) {
        mHouse.points.final = mHouse.points.ace1;
    } else {
        mHouse.points.final = mHouse.points.ace10;
    }

    if (mPlayer.points.final > mHouse.points.final) {
        console.log("win");
    } else if (mHouse.points.final > 21) {
        console.log("win");
    } else if (mPlayer.points.final === mHouse.points.final) {
        console.log("tie");
    } else {
        console.log("lost");
    }
    document.querySelector("#hit-button").removeEventListener("click", hit)
    document.querySelector("#stay-button").removeEventListener("click", stay)
    document.querySelector("#reset-button").setAttribute("class", "")

    console.log("player points: " + mPlayer.points.final);
    console.log("house points: " + mHouse.points.final);
    console.log("--------------------------------------------")
}













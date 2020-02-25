function aiSolveDraw(cards) {
    let hand = solve(cards);
    let handArray = hand.split("_");
    let unwantedCards = [];

    if (hand.includes("THREE_OF_A_KIND_")) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].value !== handArray[handArray.length - 1]) {
                unwantedCards.push(i);
            }
        }
    } else if (hand.includes("TWO_PAIRS_")) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].value !== handArray[handArray.length - 1] && cards[i].value !== handArray[handArray.length - 2]) {
                unwantedCards.push(i);
            }
        }
    } else if (hand.includes("PAIR_")) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].value !== handArray[handArray.length - 1]) {
                unwantedCards.push(i);
            }
        }
    } else if (hand.includes("HIGH_CARD_")) {
        let almostSuit = false;
        let almostStraight = false;

        for (let i = 0; i < 3; i++) {
            unwantedCards = [];
            let suit = cards[i].suit;

            for (let j = 0; j < cards.length; j++) {
                if (cards[j].suit !== suit) {
                    unwantedCards.push(j);
                }
            }

            if (unwantedCards.length <= 2) {
                almostSuit = true;
                break;
            }
        }

        console.log("almostSuit: " + almostSuit);

        if (!almostSuit) {
            if (cards[0].value === "14" && cards[1].value !== "13" || cards[1].value !== "12") {
                cards[0].value = "1";
                cards.sort((a, b) => b.value - a.value);
            }

            for (let i = 0; i < 3; i++) {
                unwantedCards = [];

                for (let j = 0; j < i; j++) {
                    unwantedCards.push(j);
                }

                for (let j = i; j < cards.length; j++) {
                    console.log("i: " + i);
                    if (parseInt(cards[i].value) - 4 > parseInt(cards[j].value)) {
                        unwantedCards.push(j);
                    }
                    console.log("kortti: " + parseInt(cards[i].value));
                }

                console.log(unwantedCards);
            }

            console.log("almostStraight: " + almostStraight);

            if (!almostSuit && !almostStraight) {
                unwantedCards = [];
                for (let i = 0; i < cards.length; i++) {
                    if (cards[i].value !== handArray[handArray.length - 1]) {
                        unwantedCards.push(i);
                    }
                }
            }
        }

        console.log("unwanted:");
        console.log(unwantedCards);
        console.log("--------------------------------------");

        if (unwantedCards.length > 0) {
            aiDiscard(cards, unwantedCards);
        }

        return unwantedCards.length;
    }
}

function aiDiscard(cards, unwantedCards) {
    for (let i = 0; i < unwantedCards.length; i++) {
        cards.splice(unwantedCards[i] - i, 1);
    }
}
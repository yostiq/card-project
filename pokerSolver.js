// solve(player[0].cards)
function solve(cards) {
    return royalFlush(cards);
}

function royalFlush(cards) {
    if (!royalChecker(cards) || !flushChecker(cards) || !straightChecker(cards)) {
        return straightFlush(cards);
    }

    return "ROYAL_FLUSH_" + cards[0].suit;
}

function straightFlush(cards) {
    if (!flushChecker(cards) || !straightChecker(cards)) {
        return fourOfAKind(cards);
    }

    return "STRAIGHT_FLUSH_" + cards[0].suit + "_" + cards[0].value;
}

function fourOfAKind(cards) {
    let sameKinds = sameKindChecker(cards, 4);
    if (sameKinds === false) {
        return fullHouse(cards);
    }

    return "FOUR_OF_A_KIND_" + sameKinds;
}

function fullHouse(cards) {
    let threeSameKinds = sameKindChecker(cards, 3);
    if (!threeSameKinds) {
        return flush(cards);
    }

    let secondPair = secondPairChecker(cards, threeSameKinds);
    if (!secondPair) {
        return flush(cards);
    }

    return "FULL_HOUSE_" + threeSameKinds + "_" + secondPair;
}

function flush(cards) {
    if (!flushChecker(cards)) {
        return straight(cards);
    }

    return "FLUSH_" + cards[0].suit;
}

function straight(cards) {
    if (!straightChecker(cards)) {
        return threeOfAKind(cards);
    }

    return "STRAIGHT_" + cards[0].value;
}

function threeOfAKind(cards) {
    let sameKinds = sameKindChecker(cards, 3);
    if (!sameKinds) {
        return twoPairs(cards);
    }

    return "THREE_OF_A_KIND_" + sameKinds;
}

function twoPairs(cards) {
    let firstPair = sameKindChecker(cards, 2);
    if (!firstPair) {
        return pair(cards);
    }

    let secondPair = secondPairChecker(cards, firstPair);
    if (!secondPair) {
        return pair(cards);
    }

    if (parseInt(secondPair) > parseInt(firstPair)) {
        return "TWO_PAIRS_" + secondPair + "_" + firstPair;
    }
    return "TWO_PAIRS_" + firstPair + "_" + secondPair;
}

function pair(cards) {
    let sameKinds = sameKindChecker(cards, 2);
    if (!sameKinds) {
        return highCard(cards);
    }

    return "PAIR_" + sameKinds;
}

function highCard(cards) {
    return "HIGH_CARD_" + cards[0].value;
}

// highestLeftOver(player[0].cards, 9, 0) if only three same cards
// highestLeftOver(player[0].cards, 9, 3) if two pairs
function highestLeftOver(cards, card1, card2) {
    let highest = 0;
    for (let i = 0; i < cards.length; i++) {
        if (parseInt(cards[i].value) !== card1 && parseInt(cards[i].value) !== card2) {
            if (parseInt(cards[i].value) > highest){
                highest = parseInt(cards[i].value);
                console.log(highest)
            }
        }
    }

    return highest;
}

function royalChecker(cards) {
    return cards[0].value === "14";
}

function flushChecker(cards) {
    let suit = cards[0].suit;
    for (let i = 1; i < cards.length; i++) {
        if (cards[i].suit !== suit) {
            return false;
        }
    }

    return true;
}

function straightChecker(cards) {
    if (cards[0].value === "14" && cards[1].value !== "13") {
        cards[0].value = "1";
        cards.sort((a, b) => b.value - a.value);
    }

    for (let i = 0; i < cards.length - 1; i++) {
        if (parseInt(cards[i].value) - 1 !== parseInt(cards[i + 1].value)) {
            if (cards[cards.length - 1].value === "1") {
                cards[cards.length - 1].value = "14";
                cards.sort((a, b) => b.value - a.value);
            }
            return false;
        }
    }

    return true;
}

function sameKindChecker(cards, wantedAmount) {
    let sameAmount;
    let wantedValue;
    for (let i = 0; i < 6 - wantedAmount; i++) {
        sameAmount = 0;
        wantedValue = cards[i].value;
        for (let j = 0; j < cards.length; j++) {
            if (cards[j].value === wantedValue) {
                sameAmount++;
                if (wantedAmount === sameAmount) {
                    return wantedValue;
                }
            }
        }
    }

    return false;
}

function secondPairChecker(cards, otherValue) {
    let first = 0;
    let wanted;
    for (let i = 0; i < 2; i++) {
        let amount = 0;
        for (let j = first; j < cards.length; j++) {
            if (cards[j].value !== otherValue && amount === 0) {
                wanted = cards[j].value;
                first = j + 1;
            }
            if (cards[j].value === wanted) {
                amount++;
            }
        }

        if (amount === 2) {
            return wanted;
        }
    }

    return false;
}
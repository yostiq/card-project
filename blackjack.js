function playBlackjack() {

    shuffleCards();
    let house = {
        points: 0
    };
    let player = {
        points: 0
    };

    for (let i = 0; i < 2; i++) {
        addToHand(drawCard(2, "house"));
        addToHand(drawCard(2, "player"));
    }

    listHand("house");
    listHand("player");
}



let cards = []

let fetchDeck = new Promise((resolve, reject) => {
    //New deck let url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=" + DECKAMOUNT
    let url = "https://deckofcardsapi.com/api/deck/dkajikxjivr7/shuffle/"
    fetch(url)
        .then(response => response.json())
        .then(json => {
            resolve(json.deck_id)
        })
        .catch(error => console.log(error))
}).then((deck_id) => {
    return new Promise((resolve, reject) => {
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
        cards[i] = json.cards[i]
    }
}).then(() => {
    console.log(cards)
})















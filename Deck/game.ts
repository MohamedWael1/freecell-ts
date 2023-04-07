export type Suit = "diamonds" | "spades" | "hearts" | "clubs";

enum CardColor {
    BLACK = "black",
    RED = "red"
}

const suits: Suit[] = ["diamonds", "spades", "hearts", "clubs"];


export class Card {

    private suit: Suit;
    private rank: number;
    private color: CardColor;
    public img: string;
    public id: string;
    public isSelected: boolean;

    constructor(suit: Suit, rank: number) {
        this.suit = suit;
        this.rank = rank;
        this.img = `/images/${this.rank + 1}${this.suit}.png`
        this.color = this.suit === "diamonds" || this.suit === "hearts" ? CardColor.RED : CardColor.BLACK;
        this.id = `${this.rank}${this.suit}`
        this.isSelected = false;
    }



    isSameSuit(card: Card): boolean {
        return this.suit === card.suit;
    }

    isSameColor(card: Card): boolean {
        return card.color === this.color;
    }

    isHigherInRank(card: Card): boolean {
        return this.rank > card.rank
    }

    getRank(): number {
        return this.rank;
    }
}

abstract class CardContracts {
    private cards: Card[];


    constructor(cards: Card[]) {
        this.cards = cards;
    }

    isEmpty(): boolean {
        return this.cards.length === 0
    }

    getLastCard(): Card {
        return this.cards[this.cards.length - 1]
    }

    abstract canCardBeInserted(card: Card[]): boolean

    insertCard(cards: Card[]) {
        if (this.canCardBeInserted(cards)) {
            this.cards = this.cards.concat(cards)
        } else return this.cards
    }

    removeCard(cardsToBeRemoved: Card[]) {
        this.cards = this.cards.filter((card, i) => !cardsToBeRemoved.includes(card))
    }

    getCards(): Card[] {
        return this.cards
    }


}

export class Pillar extends CardContracts {
    canCardBeInserted(cards: Card[]) {
        if (this.isEmpty()) {
            return true
        }
        return cards[0].isHigherInRank(this.getLastCard()) || cards[0].isSameColor(this.getLastCard()) || this.getLastCard().getRank() - cards[0].getRank() > 1 ? false : true
    }

    private areCardsSequenced(card: Card): boolean {
        const cards = this.getCards()
        const cardIndex = cards.indexOf(card);
        const slicedCards = cards.slice(cardIndex, cards.length);
        for (let i = 0; i < slicedCards.length - 1; i++) {
            if (slicedCards[i].getRank() - slicedCards[i + 1].getRank() !== 1) {
                return false
            }
        }

        return true

    }

    private areColorsAlternate(card: Card): boolean {
        const cards = this.getCards()
        const cardIndex = cards.indexOf(card);
        const slicedCards = cards.slice(cardIndex, cards.length);
        for (let i = 0; i < slicedCards.length - 1; i++) {
            if (slicedCards[i].isSameColor(slicedCards[i + 1])) {
                return false
            }
        }

        return true
    }

    private numberOfDraggableCards(freeCells: FreeCell[]): number {
        return 5 - freeCells.map(freeCell => freeCell.getNumberOfCardsInFreeCells()).reduce((a, b) => a + b, 0)
    }

    private lengthOfCardsToBeDragged(card: Card): number {
        const cards = this.getCards()
        const cardIndex = cards.indexOf(card);
        return cards.slice(cardIndex, cards.length).length
    }


    canCardBeDragged(card: Card, freeCells: FreeCell[]): boolean {
        if (this.areCardsSequenced(card) && this.areColorsAlternate(card) && this.numberOfDraggableCards(freeCells) >= this.lengthOfCardsToBeDragged(card)) {
            return true
        }
        return false
    }


}

export class FreeCell extends CardContracts {

    canCardBeInserted(cards: Card[]): boolean {
        return this.isEmpty() && cards.length === 1
    }

    getNumberOfCardsInFreeCells(): number {
        return this.getCards().length
    }

    canCardBeDragged(card: Card): boolean {
        return true
    }


}


export class Foundation extends CardContracts {
    canCardBeInserted(cards: Card[]): boolean {
        if (this.isEmpty() && cards[0].getRank() === 0) {
            return true
        } else if (this.isEmpty() && cards[0].getRank() > 0) {
            return false
        }
        const lastCard = this.getLastCard()
        return cards[0].getRank() - lastCard.getRank() === 1 && lastCard.isSameSuit(cards[0])
    }

    canCardBeDragged(card: Card): boolean {
        return true
    }
}

class Game {
    private foundations: Foundation[];
    private pillars: Pillar[];
    private freeCells: FreeCell[];
    private listeners: Function[]
    private originalCardContract: Pillar | Foundation | FreeCell | null;

    constructor(foundations: Foundation[], pillars: Pillar[], freeCells: FreeCell[]) {
        this.foundations = foundations;
        this.pillars = pillars;
        this.freeCells = freeCells
        this.listeners = []
        this.originalCardContract = null
    }
    start() {
        this.createPillars()
    }

    addListener(listener: Function) {
        this.listeners = [...this.listeners, listener]
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    }

    private createPillars(): Pillar[] {
        let deck = this.shuffleDeck();

        let pillarIndex = 0;
        let pillars: Card[][] = [...new Array(8)].map(() => []);

        for (let i = 0; i < deck.length; i++) {
            pillars[pillarIndex].push(deck[i]);
            pillarIndex = (pillarIndex + 1) % pillars.length;
        }

        this.pillars = pillars.map(pillar => new Pillar(pillar));
        return this.pillars;
    }

    private generateDeck(): Card[] {
        let deck: Card[] = [];
        for (const suit of suits) {
            for (let i = 0; i <= 12; i++) {
                deck = [
                    ...deck,
                    new Card(suit as Suit, i)
                ]
            }
        }
        return deck;
    }

    private getRandomCard(): number {
        return Math.ceil(Math.random() * this.generateDeck().length)
    }

    private shuffleDeck(): Card[] {
        let deck = this.generateDeck();
        let shuffledDeck: Card[] = [];
        for (let i = 0; i < 104; i++) {
            let splicedElem = deck.splice(this.getRandomCard(), 1);
            shuffledDeck.push(splicedElem[0])
        }

        return shuffledDeck.concat(...deck).filter(el => el !== undefined)
    }

    insertCard(selectedCards: Card[], selectedCardContract: Pillar | FreeCell | Foundation, originalCardContract: Pillar | FreeCell | Foundation) {
        if (selectedCardContract.canCardBeInserted(selectedCards)) {
            selectedCardContract.insertCard(selectedCards)
            originalCardContract.removeCard(selectedCards)
            selectedCards.forEach(card => card.isSelected === true ? card.isSelected = false : card.isSelected = true)

        } else {
            selectedCards.forEach(card => card.isSelected === true ? card.isSelected = false : card.isSelected = true)
            console.log('Card cant be inserted')
        }

    }

    selectCards(card: Card, cardContract: Pillar | FreeCell | Foundation): Card[] {
        const cards = cardContract.getCards().slice(cardContract.getCards().indexOf(card))
        if (cardContract.canCardBeDragged(card, this.freeCells)) {
            cards.forEach(card => card.isSelected === true ? card.isSelected = false : card.isSelected = true)
        }
        return cardContract.canCardBeDragged(card, this.freeCells) ? cards : []
    }

    setOriginalCardContract(cardContract: Pillar | FreeCell | Foundation) {
        this.originalCardContract = cardContract
    }

    getOriginalCardContract(): Pillar | FreeCell | Foundation | null {
        return this.originalCardContract
    }

    getFoundations(): Foundation[] {
        return this.foundations
    }

    getFreeCells(): FreeCell[] {
        return this.freeCells
    }

    getPillars(): Pillar[] {
        return this.pillars
    }
}


const freeCells = [new FreeCell([]), new FreeCell([]), new FreeCell([]), new FreeCell([])]
const foundations: Foundation[] = [new Foundation([]), new Foundation([]), new Foundation([]), new Foundation([])]
const pillars: Pillar[] = []

let game = new Game(foundations, pillars, freeCells);


export default game





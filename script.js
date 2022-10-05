// OOP - for audio sounds
class AudioController {
  constructor() {
    this.bgMusic = new Audio("Assets/Audio/creepy.mp3");
    this.flipSound = new Audio("Assets/Audio/flip.wav");
    this.matchSound = new Audio("Assets/Audio/match.wav");
    this.victorySound = new Audio("Assets/Audio/victory.wav");
    this.gameOverSound = new Audio("Assets/Audio/gameover.wav");
    // setting the background music to half it volume: 0 = would be off, and 1 would be full blast
    this.bgMusic.volume = 0.5;
    //ensures the bgMusic keeps repeating itself
    this.bgMusic.loop = true;
  }
  startMusic() {
    this.bgMusic.play();
  }
  stopMusic() {
    this.bgMusic.pause();
    //restarting the audio file from the beginning
    this.bgMusic.currentTime = 0;
  }
  flip() {
    this.flipSound.play();
  }
  match() {
    this.matchSound.play();
  }
  victory() {
    this.stopMusic();
    this.victorySound.play();
  }
  gameOver() {
    this.stopMusic();
    this.gameOverSound.play();
  }
}

// OOP for cards
class MixOrMatch {
  constructor(totalTime, cards) {
    this.cardsArray = cards;
    this.totalTime = totalTime;
    //countdown time
    this.timeRemaining = totalTime;
    //the amount of time shown in the DOM = 100 to start
    this.timer = document.getElementById("time-remaining");
    //the amount of flips shown in the DOM = 0 to start
    this.ticker = document.getElementById("flips");
    //this is the audio controller that belongs to this game
    this.audioController = new AudioController();
  }
  // what happens everytime you start a new game
  startGame() {
    //when you flip a card, it becomes cardToCheck because now you are going to click another card and its going to check to see if it's the same, if not then they will both flip over and cardtocheck will be null again
    this.cardToCheck = null;
    this.totalClicks = 0;
    this.timeRemaining = this.totalTime;
    //where we place all the matched cards
    this.matchedCards = [];
    //when true, user can't flip card
    this.busy = true;
    setTimeout(() => {
      this.audioController.startMusic();
      this.shuffleCards();
      this.countDown = this.startCountDown();
      this.busy = false;
    }, 500);
    this.hideCards();
    this.timer.innerText = this.timeRemaining;
    this.ticker.innerText = this.totalClicks;
  }
  hideCards() {
    this.cardsArray.forEach((card) => {
      card.classList.remove("visible");
      card.classList.remove("matched");
    });
  }
  flipCard(card) {
    if (this.canFlipCard(card)) {
      this.audioController.flip();
      this.totalClicks++;
      this.ticker.innerText = this.totalClicks;
      card.classList.add("visible");

      //check to see if we are looking for a match or if we are flipping a card for the first time
      if (this.cardToCheck) {
        //check for match
        this.checkForCardMatch(card);
      } else {
        this.cardToCheck = card;
      }
    }
  }
  checkForCardMatch(card) {
    if (this.getCardType(card) === this.getCardType(this.cardToCheck)) {
      //match
      this.cardMatch(card, this.cardToCheck);
    } else {
      //mismatch
      this.cardMisMatch(card, this.cardToCheck);
    }
    this.cardToCheck = null;
  }
  cardMatch(card1, card2) {
    this.matchedCards.push(card1);
    this.matchedCards.push(card2);
    card1.classList.add("matched");
    card2.classList.add("matched");
    this.audioController.match();
    if (this.matchedCards.length === this.cardsArray.length) this.victory();
  }
  cardMisMatch(card1, card2) {
    this.busy = true;
    setTimeout(() => {
      card1.classList.remove("visible");
      card2.classList.remove("visible");
      this.busy = false;
    }, 1000);
  }
  getCardType(card) {
    return card.getElementsByClassName("card-value")[0].src;
  }
  startCountDown() {
    // we are reducing the time every second and change it on the DOM
    return setInterval(() => {
      this.timeRemaining--;
      this.timer.innerText = this.timeRemaining;
      if (this.timeRemaining === 0) this.gameOver();
    }, 1000);
  }
  gameOver() {
    //The clearInterval() method clears a timer set with the setInterval() method.
    clearInterval(this.countDown);
    this.audioController.gameOver();
    document.getElementById("game-over-text").classList.add("visible");
  }
  victory() {
    clearInterval(this.countDown);
    this.audioController.victory();
    document.getElementById("victory-text").classList.add("visible");
  }
  shuffleCards() {
    //fisher-yates shuffle
    for (let i = this.cardsArray.length - 1; i > 0; i--) {
      let randIndex = Math.floor(Math.random() * (i + 1));
      //The order CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending order value and then by their source code order.
      this.cardsArray[randIndex].style.order = i;
      //so we are essentially shuffling the places between the two cards, remove card1 and place into where card2 was and then put card2 where card1 was
      this.cardsArray[i].style.order = randIndex;
    }
  }
  // what scenarios can the user not flip a specific card
  canFlipCard(card) {
    //three scenarios where they won't be able to flip a card:
    //1. if this.busy = true, this.busy is used to say an animation is happening right now, so you are not allowed to click anything until its done
    //2. if you are clicking on a card that is already a matched card, you don't want to be able to click on an already matched card
    //3. if the card that you click is the cardToCheck, we don't want to let you flip that card because it's already flipped and we are trying to find other cards to match it
    return (
      !this.busy &&
      !this.matchedCards.includes(card) &&
      card !== this.cardToCheck
    );
  }
}

function ready() {
  // getElementsByClassName returns an HTML collection - doesn't have access to all the array methods so we use Array.from
  let overlays = Array.from(document.getElementsByClassName("overlay-text"));
  let cards = Array.from(document.getElementsByClassName("card"));
  let game = new MixOrMatch(100, cards);

  overlays.forEach((overlay) => {
    overlay.addEventListener("click", () => {
      overlay.classList.remove("visible");
      //initialize the game
      game.startGame();
    });
  });
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      game.flipCard(card);
    });
  });
}

//readyState is the state of its loading process
//Essentially this if statement is saying that is the page is still loading put an event listener that says once it has loaded then call ready otherwise call ready immediately.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready());
} else {
  ready();
}

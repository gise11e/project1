
var gameBoard = document.getElementById('game-board');

var cards = [];

var level = 0;

var levelPairs = [3,5,7];

var cardTypes = ["im1", "im2", "im3", "im4","im5", "im6", "im7"];

var cardsInPlay = [];

var safeToPlay = true;

var totalMatches = 0;

var messageDiv = document.getElementById('message');

var createBoard = function() {

	for (var i = 0; i < cards.length; i++) {

		// Create the div for the card
		var cardElement = document.createElement('div');
		cardElement.className = "card";

		// Add the div to the gameboard
		gameBoard.appendChild(cardElement);

		cardElement.setAttribute('data-card', cards[i]);
		cardElement.addEventListener('click', isTwoCards);
	}
};

function setUpCards(totalPairs){
	cards = [];
	for  (var i=0; i< totalPairs; i++){
		cards.push(cardTypes[i % cardTypes.length]);
		cards.push(cardTypes[i % cardTypes.length]);
	}
}

function isMatch(selectedCards) {

	if( selectedCards[0].getAttribute('data-card') == selectedCards[1].getAttribute('data-card') )
		return true;
	else return false;
}

var won = false;

function resetBoard() {
	if(won){
		confetti.clear();
	}
	won = false;
	var bodyElements = document.getElementsByTagName('body');
	bodyElements[0].className = 'level-' + level;
	gameBoard.innerHTML='';
	setUpCards(levelPairs[level]);
	shuffle(cards);
	createBoard();

	totalMatches = 0;
	messageDiv.innerHTML = '';
    var cardsOnBoard = document.querySelectorAll(".card");
    for (var i=0; i<cardsOnBoard.length; i++) {
    	cardsOnBoard[i].innerHTML = "";
    	cardsOnBoard[i].setAttribute('data-card', cards[i]);
    }
}

var glissando = new Audio("sounds/harp_chord_glissando.mp3");

var matchSound = new Audio ("sounds/match2.mp3");

function isTwoCards() {

  if (!safeToPlay) {
  	return;
  }

  var cardElement = this;

  var typeOfCard = cardElement.getAttribute('data-card');

  cardsInPlay.push(cardElement);

  cardElement.innerHTML = '<img src="images/' + typeOfCard + '.gif" alt="' + typeOfCard + ' playing card"/>';

  if (cardsInPlay.length == 2) {

    if (isMatch(cardsInPlay)) {
    	messageDiv.innerHTML = "whoop whoop!";
			matchSound.play();
    	cardsInPlay = [];

    	totalMatches += 1;

    	if (totalMatches == (levelPairs[level])) {

				if (level == levelPairs.length-1) {
					messageDiv.innerHTML = "<h2>h o o r r a y !</h2>";
					confetti.start();
					won =  true;
				}
				else{
				  messageDiv.innerHTML = '<div class="levelup"> level ^ ! </div>';
					level++;
					transitionOut(resetBoard);
					glissando.play();
				}
    	}
    }
		    else {

    	messageDiv.innerHTML = "hit it baby, one more time!";

    	safeToPlay = false;

		// turn both cards back over after 1 second (1000ms).
    	setTimeout(function() {
    		cardsInPlay[0].innerHTML = '';
    		cardsInPlay[1].innerHTML = '';
		    cardsInPlay = [];
		    safeToPlay = true;
    	}, 1000);
    }
  }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

resetBoard();

for (var i=1; i<3; i++) {
	document.getElementById('level'+(i+1)).addEventListener('click', (function(l){
		return function() {
			level=l; resetBoard();
		};
	})(i));
}

document.getElementById('reset').addEventListener('click', function() { level=0;resetBoard();});


function transitionOut(callback) {
	var $lis = $(gameBoard).children();
	var total = $lis.length;
	$.each($lis,function(i,li){
		if (i == total-1){
			$(li).fadeOut(500*(i+1), callback);
		}
		else{
			$(li).fadeOut(500*(i+1));
		}
	});
}

$(function() {

	var screens = {};
	var currentScreen = null;

	function addScreen(id, screenObject) {
		screens[id] = screenObject;
		// Invoke the setup method if it exists.
		if (typeof screenObject.setup === 'function') {
			screenObject.setup();
		}
	}

	function transitionTo(screenId) {
		if (currentScreen !== null) {
			currentScreen.onLeave();
		}
		currentScreen = screens[screenId];
		currentScreen.onEnter();
	}

	addScreen('splash', {
		blinkSpan:null,
		splashDiv: null,
		setup: function() {
			this.blinkSpan = $('#blinking');
			this.splashDiv = $('#splash');
			this.blinkSpan.on('click', function() {
				transitionTo('memoryGame');
			});
		},
		onEnter: function() {
			this.blinkSpan.show();
			this.splashDiv.show();

		},
		onLeave: function() {
			this.blinkSpan.hide();
			this.splashDiv.hide();

		}
	});

	addScreen('memoryGame', {
		gameBoard: $('#game-board'),
		message: $('#message'),
		grid: $('.grid'),
		sidebar: $('#sidebar'),
		cards: [],
		level: 0,
		levelPairs: [3, 5, 7],
		cardTypes: ["im1", "im2", "im3", "im4","im5", "im6", "im7"],
		cardsInPlay: [],
		safeToPlay: true,
		totalMatches: 0,
		hasWon: false,

		sounds: {
			glissando: new Audio("sounds/harp_chord_glissando.mp3"),
			matchSound: new Audio ("sounds/match2.mp3"),
			winGame: new Audio ("sounds/win.mp3")
		},

		shuffle: function(arr) {
		  var currentIndex = arr.length, temporaryValue, randomIndex;
		  // While there remain elements to shuffle...
		  while (0 !== currentIndex) {
		    // Pick a remaining element...
		    randomIndex = Math.floor(Math.random() * currentIndex);
		    currentIndex -= 1;
		    // And swap it with the current element.
		    temporaryValue = arr[currentIndex];
		    arr[currentIndex] = arr[randomIndex];
		    arr[randomIndex] = temporaryValue;
		  }
		  return arr;
		},

		createBoard: function() {
			for (var i = 0; i < this.cards.length; i++) {
				var cardElement = $('<div></div>').addClass('card').attr('data-card', this.cards[i]);

				cardElement.on('click', (function(that){
					return function() {
						that.isTwoCards.apply(that, $(this));
					};
				})(this));
				this.gameBoard.append(cardElement);
			}
		},

		setUpCards: function(totalPairs) {
			this.cards = [];
			for  (var i=0; i< totalPairs; i++){
				this.cards.push(this.cardTypes[i % this.cardTypes.length]);
				this.cards.push(this.cardTypes[i % this.cardTypes.length]);
			}
		},

		isMatch: function(selectedCards) {
			return selectedCards[0].attr('data-card') == selectedCards[1].attr('data-card');
		},

		resetBoard: function() {
			if (this.hasWon) {
				confetti.clear();
			}
			this.hasWon = false;
			$('body')[0].className = 'level-' + this.level;
			this.gameBoard.html('');
			this.setUpCards(this.levelPairs[this.level]);
			this.shuffle(this.cards);
			this.createBoard();
			this.totalMatches = 0;
			this.message.html('');

			var cardsOnBoard = $('.card');
			var that = this;
			$.each(cardsOnBoard, function(i, card) {
				$(card).html('');
				$(card).attr('data-card', that.cards[i]);
			});
		},

		transitionCards: function(callback) {
			var $lis = this.gameBoard.children();
			var total = $lis.length;
			$.each($lis,function(i,li){
				if (i == total-1){
					$(li).fadeOut(500*(i+1), callback);
				}
				else{
					$(li).fadeOut(500*(i+1));
				}
			});
		},

		isTwoCards: function(cardElement) {

			var cardElement = $(cardElement);

			if (!this.safeToPlay) {
				return;
			}

			var typeOfCard = cardElement.attr('data-card');

			// Don't let a card match against itself.
			if (this.cardsInPlay.length == 1 && cardElement.get(0) === this.cardsInPlay[0].get(0)) {
				return;
			}

			this.cardsInPlay.push(cardElement);

			cardElement.html('<img src="images/' + typeOfCard + '.gif" alt="' + typeOfCard + ' playing card"/>');

			if (this.cardsInPlay.length == 2) {
				if (this.isMatch(this.cardsInPlay)) {
					// Remove click handlers of matched cards.
					this.cardsInPlay[0].off('click');
					this.cardsInPlay[1].off('click');
					this.message.html("whoop whoop!");

					this.sounds.matchSound.play();
					this.cardsInPlay = [];

					// Increment the total matches.
					this.totalMatches++;

					if (this.totalMatches == this.levelPairs[this.level]) {


						// Last level
						if (this.level == this.levelPairs.length - 1) {
							this.message.html('<h2 class="win">h o o r a y!</h2>');
							this.sounds.winGame.play();
							this.sounds.glissando.play();
							confetti.start();
							this.hasWon = true;
							this.transitionCards(this.resetBoard.bind(this));
						}
						else {
						  this.message.html('<div class="levelup"> level ^ ! </div>');
							this.level++;
							this.transitionCards(this.resetBoard.bind(this));
							this.sounds.glissando.play();
						}
					}
				}
				else {
					this.message.html("");
		    	this.safeToPlay = false;

					// turn both cards back over after 1 second (1000ms).
		    	setTimeout((function(that) {
						return function() {
							that.cardsInPlay[0].html('');
							that.cardsInPlay[1].html('');
							that.cardsInPlay = [];
							that.safeToPlay = true;
						};
					})(this), 1000);
				}
			}
		},

		setup: function() {
			var that = this;
			for (var i=1; i<3; i++) {
				$('#level'+(i+1)).on('click', (function(l){
					return function() {
						that.level=l; that.resetBoard();
					};
				})(i));
			}
			$('#reset').on('click', function() { that.level = 0; that.resetBoard(); });
		},

		onEnter: function() {
			this.resetBoard();
		},

		onLeave: function () {
			this.gameBoard.hide();
			this.grid.hide();
			this.sidebar.hide();
		}
	});

	transitionTo('splash');

});

/////GAME 2

// var chooseUniverse = new textField("choose universe");

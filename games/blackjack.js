const RandomNumberClass = require('../js_files/random');

emojiList = ['🃏', '👍']
globalFilter = null;

module.exports.blackjackClass = class blackjackClass {

    playerScores = [0, 0];

    message;

    constructor(classMessage) {

        var filter = (reaction, user) => {
            return (user.id === this.message.author.id || user.id === this.message.mentions.members.first().id);
        };

        globalFilter = filter;

        this.message = classMessage;
        this.blackjack(this.message);
    }

    blackjack(message) {

        var self = this;

        var player1 = message.author;
        var player2 = message.mentions.members.first();

        if (player2 === undefined) {

            message.channel.send('You need to play this with someone!');
            return;

        }

        if (player1.id === player2.id) {

            message.channel.send('You need to play this with someone!');
            return;
        }

        const promisePlayer1 = new Promise(function (resolve, reject) {

            var card1 = RandomNumberClass.RandomNumber(2, 14);

            self.playerScores[0] = calculateScore([card1]);

            resolve(recursiveMessaging(player1, 0, [card1], calculateScore([card1])));
        });

        const promisePlayer2 = new Promise(function (resolve, reject) {

            var card2 = RandomNumberClass.RandomNumber(2, 14);

            self.playerScores[1] = calculateScore([card2]);

            resolve(recursiveMessaging(player2, 1, [card2], calculateScore([card2])));
        });



        Promise.all([promisePlayer1, promisePlayer2]).then((scores) => {

            this.playerScores[0] = scores[0];
            this.playerScores[1] = scores[1];

            if (self.playerScores[0] > 21 && self.playerScores[1] > 21) message.channel.send("Both players lost!");

            else {

                if (self.playerScores[0] > 21 || (self.playerScores[1] > self.playerScores[0] && self.playerScores[1] < 22)) message.channel.send('<@' + player2.id + '> won!');

                if (self.playerScores[1] > 21 || (self.playerScores[0] > self.playerScores[1] && self.playerScores[0] < 22)) message.channel.send('<@' + player1.id + '> won!');

                if (self.playerScores[0] === self.playerScores[1]) message.channel.send('Tie!');

            }

            message.channel.send('<@' + player1.id + '> had ' + this.playerScores[0] + ' points and <@' + player2.id + '> had ' + this.playerScores[1] + ' points.');

        })

    }



}

recursiveMessaging = function (player, playerNumber, cards, playerScores) {

    return new Promise(function (resolve, reject) {

        playerScores = calculateScore(cards);

        if (playerScores >= 21) {
            player.send("Your total score is: " + playerScores + " and you currently have " + ConvertNumbersToCards(cards));
            resolve(playerScores);
            return;
        }

        player.send("Your total score is: " + playerScores + " and you currently have " + ConvertNumbersToCards(cards)).then(messageSent => {

            emojiList.forEach(emoji => {
                messageSent.react(emoji);
            });

            messageSent.awaitReactions(globalFilter, { max: 1 }).then(collected => {

                var choice = collected.first();
                messageSent.delete();

                if (choice.emoji.name === '🃏') {

                    var newCard = [RandomNumberClass.RandomNumber(1, 14)];

                    cards = cards.concat(newCard);

                    playerScores = calculateScore(cards);

                    resolve(recursiveMessaging(player, playerNumber, cards, playerScores));

                }

                if (choice.emoji.name === '👍') {

                    playerScores = calculateScore(cards);

                    resolve(playerScores);

                }

            })

        });

    });

}

calculateScore = function (cards) {

    var score = 0;

    var counter = 0;

    cards.forEach(curentCard => {
        if (curentCard <= 10) {
            score = score + curentCard;
        }

        if (curentCard >= 11 && curentCard <= 14) {
            score = score + 10;

            if (curentCard === 11) {
                counter = counter + 1;
                score = score + 1;
            }

        }

    });


    while (score > 21 && counter > 0) {
        score = score - 10;
        counter = counter - 1;
    }


    return (score);

}

drawFunction = function (cards) {

    var newCard = [RandomNumberClass.RandomNumber(1, 14)];

    cards = cards.concat(newCard);

    return cards;

}

ConvertNumbersToCards = function (cards) {

    cardsString = '';

    cards.forEach(element => {

        if (element > 1 && element < 11) {
            cardsString = cardsString + ' ' + element;
        }

        else {

            if (element == 1 || element == 11) {
                cardsString = cardsString + ' Ace';
            }

            else {

                if (element == 12) {
                    cardsString = cardsString + ' J';
                }

                else {

                    if (element == 13) {
                        cardsString = cardsString + ' Q';
                    }
                    else {

                        if (element == 14) {
                            cardsString = cardsString + ' K';
                        }
                    }
                }
            }
        }
    });

    return (cardsString);

}

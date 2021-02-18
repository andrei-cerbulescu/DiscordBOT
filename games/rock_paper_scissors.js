const Discord = require('discord.js');

module.exports.rockPaperScissors = class rockPaperScissors {

    constructor(message) {
        this.rps(message);
    }


    rps(message) {
        if (message.mentions.members.first() === undefined) {
            essage.channel.send("You need to play this with someone!");
            return;
        }

        if (message.mentions.members.first().id === message.author.id) {
            essage.channel.send("Please get a friend to play this with you!");
            return;
        }

        var player1 = message.author;
        var player2 = message.mentions.members.first();

        message.channel.send("Waiting for responses!").then(gameMessage => {

            var emojiList = ['🤘', '📄', '✂️'];

            var message1 = null;
            var message2 = null;

            const filter1 = (reaction, user) => {
                return user.id === message.author.id;
            };

            const filter2 = (reaction, user) => {
                return user.id === player2.id;
            };

            const promise1 = new Promise(function (resolve, reject) {
                player1.send("Rock, Paper, Scissors!").then(messageSent => {
                    message1 = messageSent;
                    emojiList.forEach(emoji => {
                        messageSent.react(emoji);
                    });

                    message1.awaitReactions(filter1, { max: 1 }).then(collected => {

                        var choice1 = collected.first();
                        message1.delete();
                        resolve(choice1);
                    });

                });

            });

            const promise2 = new Promise(function (resolve, reject) {
                player2.send("Rock, Paper, Scissors!").then(messageSent => {
                    message2 = messageSent;
                    emojiList.forEach(emoji => {
                        messageSent.react(emoji);
                    });

                    message2.awaitReactions(filter2, { max: 1 }).then(collected => {

                        var choice2 = collected.first();
                        message2.delete();
                        resolve(choice2);

                    });

                });
            });

            Promise.all([promise1, promise2]).then((choices) => {

                gameMessage.delete();

                var choice1 = choices[0];
                var choice2 = choices[1];

                choice1 = choice1.emoji.name;
                choice2 = choice2.emoji.name;

                choice1 = replaceId(choice1);
                choice2 = replaceId(choice2);

                var response = null;

                if (choice1 === choice2) {
                    message.channel.send("Tie!");
                }

                if (choice1 > choice2) {
                    if (choice1 === 2 && choice2 === 0) {
                        message.channel.send("<@" + player2.id + "> won!")
                    }

                    else {
                        message.channel.send("<@" + player1.id + "> won!")
                    }
                }

                if (choice2 > choice1) {
                    if (choice2 === 2 && choice1 === 0) {
                        message.channel.send("<@" + player1.id + "> won!")
                    }

                    else {
                        message.channel.send("<@" + player2.id + "> won!")
                    }

                }
            });

        });

    }
}

function replaceId(emoji) {
    if (emoji === '🤘') {
        return 0;
    }
    else
        if (emoji === '📄') {
            return 1;
        }
        else
            return 2;
}
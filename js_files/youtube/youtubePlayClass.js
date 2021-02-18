const fs = require('fs');
const ytdl = require('ytdl-core');
const ytScraper = require("yt-scraper-badfix");
const embedMessage = require('./embedMessage');



module.exports.youtubePlay = class youtubePlay {

    youtubeEmojiList;
    message;
    dispatcher;
    classConnection;
    classUrl;
    youtubePlaylist;

    constructor(reference) {
        this.youtubePlaylist = reference;
        this.youtubeEmojiList = ['❌'];

        //Empty constructor here. Marking it just in case I forget I made it.

    }

    returnUrl(){
        return this.classUrl;
    }

    async play(connection, song) {

        this.dispatcher = connection.play(ytdl(song, { highWaterMark: 1 << 25, filter: 'audioonly' }));

    }

    decissionFunction(message) {

        this.playMusic(message);

    }

    stopPlaying(){

        if(this.classConnection!=undefined){

            if(this.dispatcher != undefined){
                this.dispatcher.pause();
            }

            this.classConnection.disconnect();

        }

    }

    playMusic(message) {

        var classThis = this;

        var url = message.content.substring(message.content.indexOf(' ') + 1);

        this.classUrl = url;

        

            message.member.voice.channel.join().then(connection => {

                classThis.classConnection = connection;

                ytScraper.videoInfo(url).then(res => {

                    classThis.play(connection, url);

                    embedMessage.sendEmbed(url, res.title, message.channel).then(res => {

                        this.youtubeEmojiList.forEach(emoji => {

                            res.react(emoji);

                        });

                        const filter = (reaction, user) => {
                            return user.id != res.author.id;
                        }


                        res.awaitReactions(filter, { max: 1 }).then(collected => {

                            if (collected.first().emoji.name === '❌') {

                                this.stopMusicDisconnect(url);

                            }

                        })


                    });

                    setTimeout(() => {

                        if (this.classConnection != undefined) {
                            this.stopMusicDisconnect(url);
                        }

                    }, (res.length + 2) * 1000);

                    setTimeout(() => {
                        if (this.classConnection != undefined) {
                            if (this.classConnection.speaking.bitfield === 0) {

                                this.classConnection.disconnect();
                                message.channel.send("Your link can't be played!");

                            }
                        }

                    }, 5000);

                });

            })

    }


    stopMusicDisconnect(url) {

        if (this.classUrl === url) {

            this.youtubePlaylist.setIsCurentlyPlaying(false);

            if (this.dispatcher != undefined) {
                this.dispatcher.pause();
                this.dispatcher = undefined;
            }

            if (this.classConnection != undefined) {

                this.classConnection.disconnect();
                this.classConnection = undefined;

            }
        }

    }

    stopMusic() {

        new Promise((resolve, reject) => {

            if (this.dispatcher != undefined) {

                this.dispatcher.pause();

            }

            if(this.connection != undefined){
                this.connection.disconnect();
            }

            resolve();

        })

    }


}
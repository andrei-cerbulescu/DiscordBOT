const fs = require('fs');
const RandomNumberClass = require('../random');
const ytdl = require('ytdl-core');
const embedMessage = require('./embedMessage');
const youtubePlayClass = require('./youtubePlayClass');

youtubeEmojiList = ['⏭️', '❌'];

module.exports.YoutubePlayClass = class YoutubePlayClass {

    musicVector = [];
    serverID;
    dispatcher;
    isConstantlyPlaying;
    classConnection;
    embedMessageOutput = null;
    duration;
    classSongUrl;
    youtubeSinglePlayer;
    isCurentlyPlaying;

    constructor(id) {
        this.youtubeSinglePlayer = new youtubePlayClass.youtubePlay(this);
        this.serverID = id;
        this.ReadArray(this.serverID);
        this.isConstantlyPlaying = true;
        this.isCurentlyPlaying = false;
    }

    setIsCurentlyPlaying(value) {

        this.isCurentlyPlaying = value;

    }

    playSingleSong(message) {

        if(message.member.voice.channel == undefined){

            message.channel.send('You are not connected to a voice channel!');
            return;

        }

        if (this.isCurentlyPlaying === false) {

            this.isCurentlyPlaying = true;
            this.youtubeSinglePlayer.decissionFunction(message);

        }

        else {

            message.channel.send('The bot is curently playing something!');

        }
    }

    startPlayFromPlaylist(message) {

        if (this.isCurentlyPlaying === true) {

            message.channel.send("The bot is already playing a playlist! If you think this is wrong, use !playlist stop.");
            return;

        }

        else {

            if (message.member.voice.channel != null) {

                message.member.voice.channel.join().then(connection => {

                    this.playRandomFromPlaylist(connection, message);

                });
            }

            else{
                message.channel.send('You are not connected to a voice channel!');
            }
        }

    }

    ReadArray(id) {

        ensureFolderExistence('serverData');

        ensureFolderExistence('serverData/' + id);

        if (!fs.existsSync('serverData/' + id + '/serverPlaylist.json')) {
            fs.writeFileSync('serverData/' + id + '/serverPlaylist.json', '{}');
        }

        var raw_musicVector = fs.readFileSync('serverData/' + id + '/serverPlaylist.json');

        this.musicVector = JSON.parse(raw_musicVector);

    }

    playRandomFromPlaylist(connection, message) {

        this.isCurentlyPlaying = true;
        this.isConstantlyPlaying = true;
        this.classConnection = connection;
        this.classSongUrl = null;

        var curentChannel = message.channel;

        var messageSplitBySpace = message.content.split(' ');

        if (messageSplitBySpace.length != 3) {

            message.channel.send('This command format is invalid. Try using !playlist play playlistName');
            this.stopMusicLoop();

            return;

        }

        var playlistName = messageSplitBySpace[2];

        var self = this;

        if (this.musicVector[playlistName] === undefined) {

            curentChannel.send("Playlist seems to be empty or I ran into another problem!");

            this.stopMusicLoop();

            return;
        }

        if (connection === undefined) {
            return;
        }

        var position = RandomNumberClass.RandomNumber(0, this.musicVector[playlistName].length - 1);

        var song = this.musicVector[playlistName][position].url;

        this.duration = this.musicVector[playlistName][position].duration;

        embedMessage.sendEmbed(this.musicVector[playlistName][position].url, this.musicVector[playlistName][position].name, curentChannel).then(res => {

            this.embedMessageOutput = res;
            this.awaitReactionEmbed(connection, message, res);
            youtubeEmojiList.forEach(emoji => {

                this.embedMessageOutput.react(emoji);

            })

        });

        this.dispatcher = connection.play(ytdl(song, { highWaterMark: 1 << 25, filter: 'audioonly' }));

        this.replayFunction(song, this.duration, connection, message);

        this.classSongUrl = song;

    };


    replayFunction(calledSong, duration, functionConnection, message) {

        var functionCurentChannel = message.channel;

        setTimeout(() => {

            if (calledSong === this.classSongUrl && this.isConstantlyPlaying === true) {

                this.playRandomFromPlaylist(functionConnection, message);

            }

        }, (duration + 2) * 1000);

        setTimeout(() => {

            if (functionConnection.speaking.bitfield === 0) {
                this.replayFunction(calledSong, 0, functionConnection, message);
            }

        }, 5000);

    }


    awaitReactionEmbed(connection, message, monitorMessage) {

        var curentChannel = message.channel;

        const filter = (reaction, user) => {
            return user.id != monitorMessage.author.id;
        }


        monitorMessage.awaitReactions(filter, { max: 1 }).then(collected => {

            if (monitorMessage === this.embedMessageOutput) {

                var choice = collected.first();

                if (choice.emoji.name === '❌') {
                    this.stopMusicLoop();
                }

                if (choice.emoji.name === '⏭️') {

                    this.skipMusic(connection, message);

                }
            }

        });



    }


    skipMusic(connection, message) {

        if (this.dispatcher === undefined) return;

        this.isConstantlyPlaying = false;
        this.dispatcher.pause();
        this.embedMessageOutput = null;
        this.playRandomFromPlaylist(connection, message);

    }

    stopMusicLoop() {

        this.youtubeSinglePlayer.stopMusicDisconnect(this.youtubeSinglePlayer.returnUrl());
        this.isCurentlyPlaying = false;
        this.isConstantlyPlaying = false;
        this.embedMessageOutput = null;

        if (this.dispatcher != undefined) {

            this.dispatcher.pause();

        }

        if (this.classConnection != undefined) {

            this.classConnection.disconnect();

        }

        return;

    };

    async play(connection, song) {

        //this.dispatcher = connection.play(ytdl(song,{filter: 'audioonly'}));
        this.dispatcher = connection.play(ytdl(song, { highWaterMark: 1 << 25, filter: 'audioonly' }));
    };

    listPlaylists(message) {

        var response = '';

        var keys = Object.keys(this.musicVector);

        keys.forEach(element => {

            response = response + element + ' has ' + this.musicVector[element].length + ' songs.\n';

        });

        if (response === '') {
            message.channel.send('This server does not have any playlists!');
            return;
        }

        message.channel.send(response);

    }

}


function playMusicLoop(self, connection, curentChannel) {
    if (self.isConstantlyPlaying === false) return;

    self.playRandomFromPlaylist(connection, curentChannel);
}

function ensureFolderExistence(path) {

    if (fs.existsSync(path)) {
        return true;
    }
    fs.mkdirSync(path);
    ensureFolderExistence(path);
}


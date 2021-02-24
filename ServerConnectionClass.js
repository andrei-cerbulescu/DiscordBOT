const Discord = require('discord.js');
const youtubePlaylist = require('./js_files/youtube/youtubePlaylist');
const RockPaperScissors = require('././games/rock_paper_scissors');
const Shake = require('./js_files/shake');
const scrapePlaylist = require('./js_files/youtube/scrapePlaylist');
const blackjackGameClass = require('./games/blackjack');

module.exports.ServerConnection = class ServerConnection {

    serverID;
    connection;
    classDispatcher;
    youtubePlaylistPlayer;
    youtubePlayer;

    constructor(constructor_server_id) {

        this.serverID = constructor_server_id;
        this.youtubePlaylistPlayer = new youtubePlaylist.YoutubePlayClass(this.serverID);
        this.youtubePlaylistPlayer.ReadArray(this.serverID);
    }

    serverMessage(message) {

        var self = this;

        if (message.content.startsWith('!rps')) {

            new RockPaperScissors.rockPaperScissors(message);

        }

        if (message.member.voice.channel != undefined) {

            if (message.content.startsWith('!shake set 1')) {
                if (message.member.hasPermission("ADMINISTRATOR")) {
                    Shake.WriteData(1, message);
                    message.reply('Channel 1 set!');
                }
            }
            if (message.content.startsWith('!shake set 2')) {
                if (message.member.hasPermission("ADMINISTRATOR")) {
                    Shake.WriteData(2, message);
                    message.reply('Channel 2 set!');
                }
            }

            if (message.content.startsWith('!playlist play')) {

                this.youtubePlaylistPlayer.startPlayFromPlaylist(message);

            }

            if (message.content.startsWith('!yt')) {

                if (message.content != '!yt stop') {
                    this.youtubePlaylistPlayer.playSingleSong(message);
                }

            }

        }

        else{
            message.reply('You need to be connected to a voice channel in order to do that!')
        }

        if (message.content.startsWith('!shake') && message.mentions.members.first()!=undefined) {
            if (message.member.hasPermission("ADMINISTRATOR")) {
                Shake.Shake(message.mentions.members.first())
                message.delete();
            }
        }

        if (message.content.startsWith('!scrape')) {
            scrapePlaylist.scrapePlaylist(message).then(() => {
                this.youtubePlaylistPlayer.ReadArray(this.serverID);
            });

        }

        if (message.content.startsWith('!playlist dump')) {
            scrapePlaylist.sendPlaylist(message);
        }

        if (message.content.startsWith('!playlist delete')) {

            var temp = this;

            if (message.member.hasPermission("ADMINISTRATOR"))
                scrapePlaylist.deletePlaylist(message).then(() => {

                    temp.youtubePlaylistPlayer.ReadArray(this.serverID)

                });
        }

        if (message.content === '!playlist list') {
            this.youtubePlaylistPlayer.listPlaylists(message);
        }

        if (message.content === '!playlist stop' || message.content === '!yt stop') {
            this.youtubePlaylistPlayer.stopMusicLoop();
        }

        if (message.content.startsWith('!blackjack')) {
            new blackjackGameClass.blackjackClass(message);
        }

    }


}
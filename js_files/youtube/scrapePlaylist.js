fs = require('fs');
const ytScraper = require("yt-scraper-badfix")
const ytfps = require('ytfps');

module.exports.scrapePlaylist = function (message) {
    return new Promise(function (resolve, reject) {

        var messageSplitBySpace = message.content.split(' ');

        if (messageSplitBySpace.length != 3) {
            message.channel.send('This command format is incorrect! It has to be !scrape playlistName youtubePlaylistUrl');

            resolve();

        }

        var playlistName = messageSplitBySpace[1];

        link = messageSplitBySpace[2];

        id = message.guild.id;


        ensureFolderExistence('serverData/' + id);

        if (!fs.existsSync('serverData/' + id + '/serverPlaylist.json')) {
            fs.writeFileSync('serverData/' + id + '/serverPlaylist.json', '{}');
        }

        var raw_musicVector = fs.readFileSync('serverData/' + id + '/serverPlaylist.json');

        var musicVector = [];

        musicVector = JSON.parse(raw_musicVector);

        if (musicVector[playlistName] === undefined) {

            musicVector[playlistName] = [];

        }

        var prevMusicVector = musicVector[playlistName];

        if (link.search('list') === -1) {

            if (link.search('youtube') != -1) {

                ytScraper.videoInfo(link).then(res => {

                    var temp = {}
                        temp.isPrivate = res.privacy.private,
                        temp.name = res.title,
                        temp.url = res.url,
                        temp.duration = res.length
                    

                    musicVector[playlistName] = musicVector[playlistName].concat(temp);

                    fs.writeFileSync('serverData/' + id + '/serverPlaylist.json', JSON.stringify(musicVector));

                    message.channel.send('Song added successfully!');
                    resolve();


                }, reject => {

                    message.channel.send('The URL seems to be invalid!');
                    resolve();

                }

                )

            }

        }

        else {

            // ytlist(link, ['name', 'url', 'duration']).then(res => {

            //     musicVector[playlistName] = musicVector[playlistName].concat(res.data.playlist);

            //     fs.writeFileSync('serverData/' + id + '/serverPlaylist.json', JSON.stringify(musicVector));

            //     message.channel.send("Pretty sure I added " + (musicVector[playlistName].length - prevMusicVector.length) + " songs to this server's playlist. The curent modules I use only allow me to parse 100 songs each time.");

            //     resolve();
            // });

            ytfps(link).then(res=>{

                var conversionResult = [];

                res.videos.forEach(element => {
                    
                    conversionElement = {};
                    conversionElement.isPrivate = false;
                    conversionElement.name = element.title;
                    conversionElement.url = element.url;
                    conversionElement.duration = (element.milis_length)/1000;
                    conversionResult.push(conversionElement);

                });

                musicVector[playlistName] = musicVector[playlistName].concat(conversionResult);
                fs.writeFileSync('serverData/' + id + '/serverPlaylist.json', JSON.stringify(musicVector));
                message.channel.send("Pretty sure I added " + (musicVector[playlistName].length - prevMusicVector.length) + " songs to this server's playlist. The curent modules I use only allow me to parse 100 songs each time.");

                resolve();
            })

        }

    });
}

function ensureFolderExistence(path) {

    if (fs.existsSync(path)) {
        return true;
    }
    fs.mkdirSync(path);
    ensureFolderExistence(path);

}

module.exports.sendPlaylist = function (message) {

    var messageSplitBySpace = message.content.split(' ');

    if (messageSplitBySpace.length != 3) {
        message.channel.send('The format for this command is invalid! Try using !playlist dump playlistName');
        return;
    }

    var playlistName = messageSplitBySpace[2];

    var id = message.guild.id;

    ensureFolderExistence('serverData/' + id);

    if (!fs.existsSync('serverData/' + id + '/serverPlaylist.json')) {
        fs.writeFileSync('serverData/' + id + '/serverPlaylist.json', '{}');
    }

    var raw_musicVector = fs.readFileSync('serverData/' + id + '/serverPlaylist.json');

    var musicVector = [];

    musicVector = JSON.parse(raw_musicVector);

    musicVector = musicVector[playlistName];

    if (musicVector != undefined) {

        messageString = playlistName + ':\n\n';

        musicVector.forEach(element => {

            messageString = messageString.concat(element.name + ': ' + element.url + '\n');

        });

        ensureFolderExistence('userData/');
        ensureFolderExistence('userData/' + message.member.id);
        fs.writeFileSync('userData/' + message.member.id + '/serverPlaylist.txt', messageString);

        message.author.send({
            files: ['userData/' + message.member.id + '/serverPlaylist.txt']
        }).then(() => {

            fs.unlinkSync('userData/' + message.member.id + '/serverPlaylist.txt');

        });

    }

    else {
        message.channel.send('This playlist does not exist!');
    }

}

module.exports.deletePlaylist = function (message) {

    return new Promise(function (resolve, reject) {

        var messageSplitBySpace = message.content.split(' ');

        if (messageSplitBySpace.length != 3) {
            message.channel.send('The format for this command is invalid! Try using !playlist dump playlistName');
            resolve();
        }

        var playlistName = messageSplitBySpace[2];

        var raw_musicVector = fs.readFileSync('serverData/' + message.guild.id + '/serverPlaylist.json');

        var musicVector = [];

        musicVector = JSON.parse(raw_musicVector);

        if (musicVector[playlistName] === undefined) {

            message.channel.send('This playlist does not exist!');

            resolve();

        }

        delete musicVector[playlistName];

        fs.writeFileSync('serverData/' + message.guild.id + '/serverPlaylist.json', JSON.stringify(musicVector));

        message.channel.send('You deleted playlist ' + playlistName);

        resolve();
    });
}
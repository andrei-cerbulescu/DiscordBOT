var youtubeThumbnail = require('youtube-thumbnail');
const Discord = require('discord.js');

module.exports.sendEmbed = function (url, songTitle, curentChannel) {
    return new Promise(function (resolve, reject) {

        const embed = new Discord.MessageEmbed()
            .setTitle(songTitle)
            .setURL(url)
            .setThumbnail(youtubeThumbnail(url).medium.url);

        curentChannel.send(embed).then(res=>{
            resolve(res);
        });

    });
}
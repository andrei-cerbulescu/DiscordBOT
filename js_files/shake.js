const fs = require('fs');

var obiecte = null;



module.exports.ReadData = function () {

    raw_obiecte = fs.readFileSync('shakeDatabase.json');
    obiecte = JSON.parse(raw_obiecte);

}

module.exports.WriteData = function (elem, message) {

    if (obiecte != null) {

        var k = 'channel_' + elem;
        if (obiecte[message.guild.id] == null) {
            obiecte[message.guild.id] = {};
        }
        obiecte[message.guild.id][k] = message.member.voice.channel;


        fs.writeFileSync('shakeDatabase.json', JSON.stringify(obiecte));

    }

}

function shakeFunction(user, counter, prev_ch, first_ch) {

    if (user.voice.channel.id == prev_ch) {

        if (counter >= 8) {
            user.voice.setChannel(first_ch);
        }

        else {
            setTimeout(() => {
                if (user.voice.channel != null) {
                    var k = 'channel_' + (counter % 2 + 1);

                    user.voice.setChannel(obiecte[user.guild.id][k].id);

                    shakeFunction(user, counter + 1, obiecte[user.guild.id]['channel_' + ((1 + counter) % 2 + 1)].id, first_ch);
                }
            }, 1000);
        }
    }
}

module.exports.Shake = function (user) {

    if(user === undefined) return;

    var elem_curent = obiecte[user.guild.id];

    user.voice.setChannel(elem_curent.channel_1.id);

    shakeFunction(user, 1, user.voice.channel.id,  user.voice.channel);

}


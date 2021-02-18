const { Message } = require("discord.js");

module.exports.purge_user_channel_function = function (message) {

    message.channel.messages.fetch().then(async messages => {

        messages.array().reverse().forEach(msg => {

            if (msg.member === message.member) {
                msg.delete();
            }
        })

    });

}
-
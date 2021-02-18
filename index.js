const Discord = require('discord.js');
const ServerConnectionClass = require('./ServerConnectionClass');
const ReturnLoginToken = require('./token_file');
var onStart = require('./js_files/initialization/onStart')
const fs = require('fs')
var rimraf = require("rimraf")

const client = new Discord.Client();

var map = new Map();

client.on('ready', () => {

    onStart.InitializeModules();

    fs.readdir('./serverMusic', function (err, files) {

        if (files != undefined) {

            files.forEach(function (file) {

                rimraf('./serverMusic/' + file, function () { });

            })
        }
    })

    console.log("Bot is online!");


});

client.login(ReturnLoginToken.ReturnToken());

client.on('message', async message => {

    if (message.content.startsWith('!')) {

        if (message.guild != null) {

            var mapResult = map[message.guild.id];

            if (mapResult === undefined) {
    
                map[message.guild.id] = new ServerConnectionClass.ServerConnection(message.guild.id)

                mapResult =  map[message.guild.id];
    
            }

            mapResult.serverMessage(message);

        }

        
    }

});
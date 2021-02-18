//Call functions here that are required to read data on startup

const youtube = require('../youtube/youtubePlayClass');
const shake = require('./../shake');

module.exports.InitializeModules = function (){

    shake.ReadData();

}
const player = require('../websocket/player');
async function addFile(req, res) {
    var data = req.body;
    if (data.gameName && player.games[data.gameName]) {
        if (!player.filesData[data.gameName]) {
            player.filesData[data.gameName] = { };
        }
        player.filesData[data.gameName][data.fileName] = { data: data.data, fileType: data.fileType, playerName: data.playerName };
        var msg = { func: 'fileAdded', gameName: data.gameName, playerName: data.playerName, fileName: data.fileName };
        player.gamesFunctions.sendMessage(data.gameName, data.playerName, msg);
    }
    // console.log(data);
    res.send({ msg: 'added' });
}

async function getFile(req, res) {
    var data = req.body;
    if (data.gameName && player.games[data.gameName]) {
        if (!player.filesData[data.gameName]) {
            player.filesData[data.gameName] = { };
        }
        if (player.filesData[data.gameName][data.fileName]) {
            res.send({ err: false, fileName: data.fileName, data: player.filesData[data.gameName][data.fileName].data, fileType: player.filesData[data.gameName][data.fileName].fileType, playerName: player.filesData[data.gameName][data.fileName].playerName });
        } else {
            res.send({ err: true, data: '' });
        }
    }
}

module.exports = { addFile, getFile };
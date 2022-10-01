var games = { }
var gamesFunctions = {
    hasPlayer: function(gameName, playerName) {
        if (games[gameName]) {
            var maxPlayer = games[gameName].maxPlayer;
            for (var i = 0; i < maxPlayer; i++) {
                if (games[gameName].players[i] && games[gameName].players[i] == playerName) {
                    return true;
                }
            }
        }
        return false;
    },
    sendMessage: function(gameName, fromPlayer, msg, toPlayer) {
        console.log('sending');
        if (playersData.hasPlayer(gameName, fromPlayer)) {
            for (var i = 0; i < games[gameName].maxPlayer; i++) {
                console.log('to', games[gameName].players[i]);
                if (games[gameName].players[i] && (!toPlayer || games[gameName].players[i] == toPlayer)) {
                    playersData.getPlayerConnection(gameName, games[gameName].players[i]).sendUTF(JSON.stringify(msg));
                }
            }
        }
    },
    updateGameState: function(gameName, cmd, key, msg, modify) {
        // cmd => replace, push, key
        var st = games[gameName]['gameState'];
        for (var i = 0; i < modify.length; i++) {
            if (st[modify[i]])
                st = st[modify[i]];
            else if (i == modify.length - 1 && cmd == 'push') {
                st[modify[i]] = [ ];
                st = st[modify[i]];
            } else {
                st[modify[i]] = { };
                st = st[modify[i]];
            }
        }
        if (cmd == 'replace') st[key] = msg;
        else if (cmd == 'push') st.push(msg);
        else if (cmd == 'key') st[key] = msg;
    }
}
var playersData = {
    hasPlayer: function(gameName, playerName) {
        return playersData[gameName + playerName] && playersData[gameName + playerName][1] == gameName;
    },
    getPlayer: function(gameName, playerName) {
        return playersData[gameName + playerName]
    },
    getPlayerConnection: function(gameName, playerName) {
        if (playersData.getPlayer(gameName, playerName)) return playersData.getPlayer(gameName, playerName)[0]
    }
}
var filesData = { }

function newGame(gameName, maxPlayer, gameState) {
	games[gameName] = { gameName: gameName, maxPlayer: maxPlayer, players: { }, gameState: gameState };
}

function addPlayer(connection, gameName, playerName, maxPlayer, gameState) {
	// var address = connection.remoteAddress + ":" + playerName;
	var address = playerName;
	if (!games[gameName]) {
		newGame(gameName, maxPlayer, gameState);
	}
	if (!playersData[gameName + address]) {
		var added = false;
		var playerNo = -1;
		for (var i = 0; i < games[gameName].maxPlayer; i++) {
			if (!games[gameName].players[i]) {
				games[gameName].players[i] = address;
				added = true;
				playerNo = i;
				playersData[gameName + address] = [ connection, gameName, i ];
				break;
			}
		}
		if (added) {
			var msg = { func: 'gameStateUpdate', data: games[gameName] }
			connection.sendUTF(JSON.stringify(msg));
			msg = { func: 'playerAdded', playerNo: playerNo, playerName: playerName, data: games[gameName] };
            gamesFunctions.sendMessage(gameName, playerName, msg);
			// for (var i = 0; i < games[gameName].maxPlayer; i++) {
			// 	if (games[gameName].players[i]) {
			// 		playersData[gameName + games[gameName].players[i]][0].sendUTF(JSON.stringify(msg));
			// 	}
			// }
		}
	} else {
        playersData.getPlayer(gameName, playerName)[0] = connection;
        var msg = { func: 'gameStateUpdate', data: games[gameName] }
        connection.sendUTF(JSON.stringify(msg));
        msg = { func: 'playerAdded', playerNo: playerNo, playerName: playerName, data: games[gameName] }
        gamesFunctions.sendMessage(gameName, playerName, msg, playerName);
	}
	console.log('adding player');
	console.log(games);
	console.log(playersData);
	console.log('------');
}

function removePlayer(connection) {
	var address = connection.remoteAddress;
	if (playersData[address]) {

	}
}

module.exports = { games, playersData, filesData, gamesFunctions, newGame, addPlayer, removePlayer };
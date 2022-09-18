var bodyParser = require('body-parser');
var express = require('express');
var serveStatic = require('serve-static');
var http = require('http');
var fs = require("fs");
var WebSocketServer = require('websocket').server;
const path = require('node:path');


var app = express();
// app.use('/*', express.static(path.join(__dirname, 'web')));
app.use(express.static(path.join(__dirname, 'web')));
//app.get('/test', serveTest);
// app.all('/*', express.static('./web'));
// app.all('/web', express.static('./web'));
var server =  http.createServer(app);
server.listen(process.env.PORT || 9603);

/*
function serveTest(req, res) {
	res.send('test');
}
*/



function serveHtml(req, res) {
	fs.readFile('./web/index.html', function(err, data) {
		if (err) { common.errorTEXT(req, res); return; }
		res.set("Content-Type", "html");
		res.send(data);
	});
}


wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
			var msg = JSON.parse(message.utf8Data);
			if (msg.func == 'addPlayer') {
				addPlayer(connection, msg.gameName, msg.playerName, msg.maxPlayer, msg.gameState);
			} else if (msg.func == 'sendMessage') {
				msg.func = 'receivedMessage';
				sendMessage(connection, msg.gameName, msg.playerName, msg);
			}
            console.log('Received Message: ' + message.utf8Data);
            // connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            // connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
		removePlayer(connection);
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

var games = { }
var playersData = { }

function newGame(gameName, maxPlayer, gameState) {
	games[gameName] = { gameName: gameName, maxPlayer: maxPlayer, players: { }, gameState: gameState };
}
function addPlayer(connection, gameName, playerName, maxPlayer, gameState) {
	var address = connection.remoteAddress + ":" + playerName;
	if (!games[gameName]) {
		newGame(gameName, maxPlayer, gameState);
	}
	if (!playersData[address]) {
		var added = false;
		var playerNo = -1;
		for (var i = 0; i < games[gameName].maxPlayer; i++) {
			if (!games[gameName].players[i]) {
				games[gameName].players[i] = address;
				added = true;
				playerNo = i;
				playersData[address] = [ connection, gameName, i ];
				break;
			}
		}
		if (added) {
			var msg = { func: 'gameStateUpdate', data: games[gameName] }
			connection.sendUTF(JSON.stringify(msg));
			msg = { func: 'playerAdded', playerNo: playerNo, data: games[gameName] }
			for (var i = 0; i < games[gameName].maxPlayer; i++) {
				if (games[gameName].players[i]) {
					playersData[games[gameName].players[i]][0].sendUTF(JSON.stringify(msg));
				}
			}
		}
	} else {

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
function sendMessage(connection, gameName, playerName, msg) {
	var address = connection.remoteAddress + ":" + playerName;
	console.log('sending message from', address, playersData[address]);
	if (playersData[address] && playersData[address][1] == gameName) {
		for (var i = 0; i < games[gameName].maxPlayer; i++) {
			console.log('to', games[gameName].players[i]);
			if (games[gameName].players[i]) {
				playersData[games[gameName].players[i]][0].sendUTF(JSON.stringify(msg));
			}
		}
	}
}

console.log('path: http://localhost:9603');
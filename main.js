var bodyParser = require('body-parser');
var express = require('express');
var serveStatic = require('serve-static');
var http = require('http');
var fs = require("fs");
var WebSocketServer = require('websocket').server;


var app = express();
app.use('/web', express.static('./web'));
//app.get('/test', serveTest);
// app.all('/*', express.static('./web'));
// app.all('/web', express.static('./web'));
var server =  http.createServer(app)
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
				addPlayer(connection, msg.gameName, msg.maxPlayer, msg.gameState);
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

games = { }
palyersData = { }

function newGame(gameName, maxPlayer, gameState) {
	games[gameName] = { gameName: gameName, maxPlayer: maxPlayer, players: { }, gameState: gameState };
}
function addPlayer(connection, gameName, maxPlayer, gameState) {
	var address = connection.remoteAddress;
	if (!games[gameName]) {
		newGame(gameName, maxPlayer, gameState);
	}
	if (!playersData[address]) {
		for (var i = 0; i < games[gameName].maxPlayer; i++) {
			if (!games[gameName].players[i]) {
				games[gameName].players[i] = connection;
				break;
			}
		}
		var msg = { func: 'gameStateUpdate', data: games[gameName] }
		connection.sendUTF(JSON.stringify(msg));
	} else {

	}
}
function removePlayer(connection) {
	var address = connection.remoteAddress;
	if (playersData[address]) {

	}
}
function sendMessage(connection, gameName, msg) {
	var address = connection.remoteAddress;
	if (playersData[address] == gameName) {

	}
}

console.log('path: http://localhost:9603');
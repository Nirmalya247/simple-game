var bodyParser = require('body-parser');
var express = require('express');
var serveStatic = require('serve-static');
const cors = require('cors');
var http = require('http');
var fs = require("fs");
var WebSocketServer = require('websocket').server;
const path = require('node:path');
const player = require('./websocket/player');
const files = require('./web-http/file');


var app = express();
app.use(bodyParser({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post('/files/addFile', files.addFile);
app.post('/files/getFile', files.getFile);
app.use(express.static(path.join(__dirname, 'web')));

// app.use('/*', express.static(path.join(__dirname, 'web')));
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
				player.addPlayer(connection, msg.gameName, msg.playerName, msg.maxPlayer, msg.gameState);
			} else if (msg.func == 'sendMessage') {
				msg.func = 'receivedMessage';
				player.gamesFunctions.sendMessage(msg.gameName, msg.playerName, msg, msg.toPlayer);
			} else if (msg.func == 'updateGameState') {
				// msg.func = 'receivedMessage';
				player.gamesFunctions.updateGameState(msg.gameName, msg.cmd, msg.key, msg.data, msg.modify);
			}
            // console.log('Received Message: ' + message.utf8Data);
            // connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            // console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            // connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
		player.removePlayer(connection);
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});





console.log('path: http://localhost:' + (process.env.PORT || 9603));
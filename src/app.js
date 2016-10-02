

var socketIO = require("socket.io");
var path = require('path');

var HTTP_PORT = 80;
var WS_PORT = 3000;

var RoomManager = require('./RoomManager');
var roomManager = new RoomManager();

var express = require("express");
var app = express();
// var fs = require("fs");

exports.init = function () {
  var http = require("http").Server(app);

  http.listen(HTTP_PORT, () => {
    console.log('HTTP listening on', HTTP_PORT);
    console.log('WS   listening on', WS_PORT);
  });


  app.get('/', function (req, res) {
    var host = req.get('host');
    console.log('GET / token is ', req.query.token);

    // if player comes with no token
    if (req.query.token === undefined) {
      // make a new room and redirect
      var newRoom = roomManager.newRoom(
        function (newRoom) {

        },
        function (newRoom) {
          newRoom.game.signals.updated.add(function (data) {
            console.log(data.x, data.y, data.newVal);
          });
        }
      );

      var token = newRoom.game.globals.players[0].token;
      res.redirect('/?token=' + token);
      return;
    }

    res.sendFile(path.resolve('public/index.html'));
  });

  app.get('/newRoom', function (req, res, next) {
    var host = req.get('host');
    var newRoom = roomManager.newRoom(
      function (newRoom) {

      },
      function (newRoom) {
        newRoom.game.signals.updated.add(function (data) {
          console.log(data.x, data.y, data.newVal);
        });
      }
    );

    var players = (newRoom.game.globals.players
      .map(function (player) {
        return {
          token: host + '?token=' + player.token
        };
      })
    );

    var result = {
      players
    };
    res.json(result);
  });

  app.get('/token', function (req, res, next) {
    var result = {
      token: 0
    };
    res.json(result);
  });

  app.get('/rooms', function (req, res, next) {
    var host = req.get('host');
    var newRoomLink = req.protocol + '://' + host + '/newRoom';
    var rooms = roomManager.getRooms();
    res.send(
      '<p>' +
      rooms.length + ' rooms active' + '<br />' +
      '<a href="' + newRoomLink + '" target="_blank">Make New Room</a>' +
      '</p>' +
      (rooms
        .map(function (room) {
          return 'Room ' + room.id + ' (mines: ' + room.game.globals.totalMines + ')' + ':<br />' +
            (room.game.globals.players
              .map(function (player) {
                return {
                  tokenLink: req.protocol + '://' + host + '?token=' + player.token
                };
              })
              .map(function (player) {
                return '<a href="' + player.tokenLink + '"target="_blank">' + player.tokenLink + '</a>';
              })
              .join('<br/>')
            );
        })
        .join('<hr />')
      )
    )
  });

  app.use(express.static(path.resolve('public')));

  app.use('/assets', express.static(__dirname + '/../assets'));

  var io = socketIO.listen(http);


  io.on("connection", function (socket) {
    var query = socket.handshake.query;
    var token = query.token;


    if (!roomManager.roomExists(token)) {
      console.log(socket.id + ' has the wrong token: ' + token);
      socket.disconnect();
      return;
    } else {
      console.log(socket.id + " connected using token: " + token);
    }

    socket.on("click", function (data) {
      var who = data.who;
      // var token = data.token;
      var x = data.x;
      var y = data.y;

      var room = roomManager.getRoomByToken(token);
      var who = roomManager.getPlayerIDByToken(token);
      console.log('room' + room.id + ': [' + who + '] clicks ' + '(' + x + ', ' + y + ')');

      if (room.game.globals.turn != who) {
        console.log('not his turn');
      } else {
        // reveal the position
        var hasMine = room.game.action.index(x, y);
        if (hasMine === -1) {
          console.log('invalid space');

        } else {
          // pass the turn if no mine is found
          // TODO: game logic should be inside game.js
          if (hasMine === 0) {
            room.game.globals.turn = (room.game.globals.turn + 1) % 2;
          }
          sendState(room);
        }

      }
    });

    socket.on("disconnect", function () {
      console.log("disconnected: " + socket.id + ", token: " + token);
      var room = roomManager.getRoomByToken(token);
      var playerID = roomManager.getPlayerIDByToken(token);
      room.game.globals.players[playerID].isOnline = false;

      sendState(room);
      roomManager.clearEmptyRooms();
    });

    var room = roomManager.getRoomByToken(token);
    socket.join(room.id);

    var playerID = roomManager.getPlayerIDByToken(token);
    room.game.globals.players[playerID].isOnline = true;

    var fdPlayerID = (playerID + 1) % 2;
    var fdToken = room.game.globals.players[fdPlayerID].token;

    var welcomePack = {
      who: playerID,
      fd: fdToken
    };
    io.sockets.connected[socket.id].emit('init', welcomePack);

    sendState(room);
  });

  function sendState(room) {

    var state = room.game.util.getState();
    // console.log(state);
    // console.log(room.game.globals.players[0], room.game.globals.players[1]);
    var players = room.game.globals.players.map(function (player) {
      return {
        name: player.name,
        score: player.score,
        bombs: player.bombs,
        isOnline: player.isOnline
      }
    });
    state.players = players;
    state.turn = room.game.globals.turn;
    console.log(state.masked);
    io.to(room.id).emit('state', state);
  }

};

function makeTokenUrl(token) {
  return + HTTP_PORT + '?token=' + token;
}

// displays any unhandled errors. by default they are swallowed if these lines aren't here
// see https://nodejs.org/api/process.html#process_event_unhandledrejection
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise \n', p, ' \nreason: \n', reason);
  // application specific logging, throwing an error, or other logic here
});
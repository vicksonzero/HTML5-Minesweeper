

var socketIO = require("socket.io");

var HTTP_PORT = 80;
var WS_PORT = 3000;

var RoomManager = require('./RoomManager');
var roomManager = new RoomManager();

var express = require("express");
var app = express();
// var fs = require("fs");

exports.init = function () {
  var rooms = new RoomManager();
  var http = require("http").Server(app);

  http.listen(HTTP_PORT, () => {
    console.log('HTTP listening on', HTTP_PORT);
    console.log('WS   listening on', WS_PORT);
  });

  app.use(express.static(__dirname + '/../public'));

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/../public/index.html');
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
    res.send(
      '<p>' +
      roomManager.rooms.length + ' rooms active' + '<br />' +
      '<a href="' + newRoomLink + '" target="_blank">Make New Room</a>' +
      '</p>' +
      roomManager.rooms
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
  });

  app.use('/assets', express.static(__dirname + '/../assets'));

  var io = socketIO.listen(WS_PORT);


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
      var token = data.token;
      var x = data.x;
      var y = data.y;

      var room = roomManager.getRoomByToken(token);
      console.log('room' + room.id + ", click " + who + '(' + x + ', ' + y + ')');

      if (room.game.globals.turn == who) {
        room.game.action.index(x, y);
        var state = room.game.util.getState();
        // console.log(state);
        console.log(room.game.globals.players[0], room.game.globals.players[1]);
        console.log(state.masked);
        io.to(room.id).emit('state', state);
      } else {
        console.log('not his turn');
      }
    });

    socket.on("disconnect", function () {
      console.log("disconnected: " + socket.id);

    });
    var room = roomManager.getRoomByToken(token);
    socket.join(room.id);

    var welcomePack = {
      who: roomManager.getPlayerIDByToken(token)
    };
    io.sockets.connected[socket.id].emit('init', welcomePack);

    var state = room.game.util.getState();
    io.sockets.connected[socket.id].emit('state', state);
  });

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
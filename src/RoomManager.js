var Game = require('./game');

function RoomManager() {
  this.rooms = {};
  this.nextRoomID = 0;
}

// RoomManager.prototype


RoomManager.prototype.newRoom = function newRoom(beforeInitCallback, afterInitCallback) {
  var id = this.nextRoomID;
  this.nextRoomID++;

  var newRoom = {
    id,
    game: new Game(),
    lastUsed: Date.now()
  };
  this.rooms[id] = newRoom;

  beforeInitCallback(newRoom);

  newRoom.game.core.init();
  newRoom.game.core.reset();

  afterInitCallback(newRoom);
  return newRoom;
};

RoomManager.prototype.getRooms = function getRooms() {
  var arr = Object.keys(this.rooms).map(function (key) { return this.rooms[key]; }.bind(this));
  return arr;
}


RoomManager.prototype.getToken = function getToken(roomID, playerID) {
  return this.getRoomByID(roomID).game.globals.players[playerID].token;
};

RoomManager.prototype.roomExists = function getToken(token) {
  return this.getRoomByToken(token) !== null;
};

RoomManager.prototype.getRoomByToken = function (token) {
  var rooms = this.getRooms();
  for (var i = 0; i < rooms.length; i++) {
    var room = rooms[i];
    for (var j = 0; j < room.game.globals.players.length; j++) {
      if (room.game.globals.players[j].token == token) {
        return room;
      }
    }
  }
  return null;
};

RoomManager.prototype.getPlayerIDByToken = function (token) {
  var rooms = this.getRooms();
  for (var i = 0; i < rooms.length; i++) {
    var room = rooms[i];
    for (var j = 0; j < room.game.globals.players.length; j++) {
      if (room.game.globals.players[j].token == token) {
        return j;
      }
    }
  }
  return null;
};

RoomManager.prototype.getRoomByID = function (roomID) {
  return this.rooms[roomID] || null;
};

RoomManager.prototype.clearEmptyRooms = function () {
  // var now = Date.now();
  // this.rooms.forEach(function (room) {
  //   if (now - room.lastUsed > this.idleRoomLimit) {
  //     this.kickAll(room.id);
  //     this.removeRoom(room.id);
  //   }
  // }.bind(this));
  this.getRooms().forEach(function (room) {
    var isEmpty = room.game.globals.players.every(function (player) {
      return player.isOnline === false;
    });
    if (isEmpty) {
      // this.kickAll(room.id);
      this.removeRoom(room.id);
    }
  }.bind(this));
};

RoomManager.prototype.removeRoom = function (roomID) {
  console.log('remove room ' + roomID);
  delete this.rooms[roomID];
};



module.exports = RoomManager;

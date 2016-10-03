var Game = require('./game');

function RoomManager() {
  this.rooms = {};
  this.nextRoomID = 0;
  this.idleRoomLimit = 1 * 60 * 1000; // 1min
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
  var rooms = this.getRooms();
  if (rooms.length < 1) {
    return -1;
  }

  var deletedRoomCount = 0;
  var now = Date.now();
  console.log(now);
  
  rooms.forEach(function (room) {
    var isEmpty = room.game.globals.players.every(function (player) {
      return player.isOnline === false;
    });
    console.log('Room ' + room.id + ': ' + (isEmpty ? 'empty ' : '      ') + (now - room.lastUsed));
    var hasBeenLongTime = now - room.lastUsed > this.idleRoomLimit;
    if (isEmpty && hasBeenLongTime) {
      // this.kickAll(room.id);
      this.removeRoom(room.id);
      deletedRoomCount++;
    }
  }.bind(this));

  return deletedRoomCount;
};

RoomManager.prototype.removeRoom = function (roomID) {
  console.log('remove room ' + roomID);
  delete this.rooms[roomID];
};



module.exports = RoomManager;

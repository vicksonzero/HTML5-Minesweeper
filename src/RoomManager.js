var Game = require('./game');

function RoomManager(){
  this.rooms = [];
}

// RoomManager.prototype


RoomManager.prototype.newRoom = function newRoom(beforeInitCallback, afterInitCallback){
  var id = this.rooms.length;
  var newRoom = {
    id,
    game: new Game()
  };
  this.rooms.push(newRoom);

  beforeInitCallback(newRoom);

  newRoom.game.core.init();
  newRoom.game.core.reset();

  afterInitCallback(newRoom);

  return newRoom;
};

RoomManager.prototype.getToken = function getToken(roomID, playerID){
  return this.getRoomByID(roomID).game.globals.players[playerID].token;
};

RoomManager.prototype.roomExists = function getToken(token){
  return this.getRoomByToken(token) !== null;
};

RoomManager.prototype.getRoomByToken = function(token){
  for(var i=0; i < this.rooms.length; i++){
    var room = this.rooms[i];
    for(var j=0; j < room.game.globals.players.length; j++){
      if(room.game.globals.players[j].token == token){
        return room;
      }
    }
  }
  return null;
};

RoomManager.prototype.getPlayerIDByToken = function(token){
  for(var i=0; i < this.rooms.length; i++){
    var room = this.rooms[i];
    for(var j=0; j < room.game.globals.players.length; j++){
      if(room.game.globals.players[j].token == token){
        return j;
      }
    }
  }
  return null;
};

RoomManager.prototype.getRoomByID = function(roomID){
  return this.rooms[roomID];
};

module.exports = RoomManager;

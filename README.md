# Socketio-Minesweeper

Real-time, Multiplayer MSN-Minesweeper game using socket.io, jQuery and HTML5 canvas.

(Forked from https://github.com/Joeynoh/HTML5-Minesweeper)


## Play Here

http://dickson.md/msnSweeper/

Open this link and share the other link with your friend to start.

![Screenshot](https://github.com/vicksonzero/socketio-Minesweeper/blob/master/screenshots/screenshot01.png)


## How to play

**Aim**: To discover (click on) more mines than your opponent. This is the opposite of the traditional minesweeper.

1. You and your opponents take turns clicking on a tile that is not opened.
    1. If it is a mine, you get a point and one more try.
    2. If it is not a mine,
        1. It will show how many mines it is touching (1-8)
        2. If no mine is touching this tile, it will automatically open all touching tiles, causing a chain reaction
2. The game ends when a player finds more than 50% mines


## How to use

### Set up (production)

    $ git clone https://github.com/vicksonzero/socketio-Minesweeper.git
    $ npm install
    $ npm start


### End points

1. `GET /` starts a new game, join it and show a link for the other player
2. `GET /?token=TOKEN` joins a game with a token.
3. `GET /newRoom` starts a new game, returns JSON
4. `GET /rooms` lists all games


## Advanced

### Nested Express modules

`src/app.js` is in fact an `express.Router`. It means that you can do the following:

    var express = require('express');
    var app = express();
    var msnSweeper = require('src/app');
    app.use('/msnSweeper/', msnSweeper);

and serve msnSweeper inside another express module.


### Auto-resume / kill rooms

Game rooms are open by going to `GET /`, and is maintained as long as 1 of the players are still in the room.

Unfortunately, once both players leave the room, it is immediately destroyed.


### Socket.io and DigitalOcean

I have no idea why, but you need to fill in actual ip address for socket.io stuff to work on DigitalOcean.


## Roadmap

1. Use bootstrap
1. clean up commented unused code
1. use view engines to inject data
1. use colored flags to distinguish mines flagged by different players
1. 5x5 bombs (well.....)
1. mobile-friendly


## Bug Reporting and Contributions

Please [open issues](issues) and/or pull requests. I am more than happy to follow-up.


## License

The MIT License (MIT)  
Copyright (c) 2016 Chui Hin Wah


[issues]: https://github.com/vicksonzero/socketio-Minesweeper/issues

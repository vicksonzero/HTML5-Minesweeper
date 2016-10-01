# Socketio-Minesweeper

Real-time, Multiplayer MSN-Minesweeper game using socket.io, jQuery and HTML5 canvas.

(Forked from https://github.com/Joeynoh/HTML5-Minesweeper)

![Screenshot](https://github.com/vicksonzero/socketio-Minesweeper/blob/master/screenshots/screenshot01.png)

## Play Here

https://vicksonzero.github.io/socketio-Minesweeper


## How to play

**Aim**: To discover (click on) more mines than your opponent. This is the opposite of the traditional minesweeper.

1. You and your opponents take turns clicking on a tile that is not opened.
    1. If it is a mine, you get a point and one more try.
    2. If it is not a mine,
        1. It will show how many mines it is touching (1-8)
        2. If no mine is touching this tile, it will automatically open all touching tiles, causing a chain reaction
2. The game ends when a player finds more than 50% mines

## How to use

    $ git clone https://github.com/vicksonzero/socketio-Minesweeper.git
    $ npm install
    $ npm start

## License

The MIT License (MIT)
Copyright (c) 2016 Chui Hin Wah



var HTTP_PORT = 80;
var WS_PORT = 3008;

var express = require('express');
var app = express();

var http = require("http").Server(app);

http.listen(HTTP_PORT, () => {
  console.log('HTTP listening on', HTTP_PORT);
  console.log('WS   listening on', WS_PORT);
});



var msnSweeper = require('./src/app')();

app.use('/msnSweeper/', msnSweeper);

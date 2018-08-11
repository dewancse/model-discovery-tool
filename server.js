'use strict';

// Constants
var PORT = 8080;
var HOST = '127.0.0.1';

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.text());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use('/', express.static('public'));

/**
 * API
 */
app.get('/api', function (req, res, next) {
    var data = {
        message: 'Hello World!'
    };
    res.status(200).send(data);
});

app.get('/server.html', function (req, res, next) {
    var data = {
        message: 'Hello World!'
    };
    res.status(200).send(data);
});

module.exports = app;

app.listen(PORT, function () {
    console.log('Express server listening on port ' + PORT);
});
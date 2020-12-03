const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authentication = require('./routes/authentication');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', authentication);

app.get('/', (req, res) => {
    res.status(200).send("Express login API");
});

module.exports = app;
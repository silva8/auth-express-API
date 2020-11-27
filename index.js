const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const user = require('./routes/user');

const app = express();

mongoose.connect(
    db.DATABASE, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    },
    (err) => {
        if (err) console.log(err);
        console.log("Succesfully connected");
    } 
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', user);

app.get('/', (req, res) => {
    res.status(200).send("Express login API");
});

const PORT = process.env.PORT||3000;
app.listen(PORT, () => {console.log(`App is up and running at port ${PORT}`); });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./../config/config').get(process.env.NODE_ENV);

const salt = 10;

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        maxlength: 100
    },
    lastname: {
        type: String,
        required: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    password2:{
        type: String,
        required: true,
        minlength: 8
    },
    token:{
        type: String
    }
});

// save hashed password
userSchema.pre('save', function(next) {
    var user = this;
    if(user.isModified('password')) {
        bcrypt.hash(this.password, salt, (err, hash) => {
            if(err) return next(err);
            user.password = hash;
            user.password2 = hash;
            next();
        });
    }
    else 
        next();
});

// validate password
userSchema.methods.validatePassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if(err) return cb(err);
        cb(null, isMatch);
    });
}

// generate token
userSchema.methods.generateToken = function(cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), config.SECRET);

    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    });
}

// find user by token
userSchema.statics.findByToken = function(token, cb) {
    var user = this;
    jwt.verify(token, config.SECRET, function(err, decode) {
        user.findById(decode, function (err, user) {
            if(err) return cb(err);
            cb(null, user);
        });
    });
}

// delete token
userSchema.methods.deleteToken = function(cb) {
    var user = this;
    user.update({$unset: {token: 1}}, function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    });
}

module.exports = mongoose.model('User', userSchema);

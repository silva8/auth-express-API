const express = require('express');
const User = require('./../models/User');
const { auth } = require('./../middlewares/auth');

const router = express.Router();

// "singup" node - create a new user
router.post('/singup', (req, res) => {
    let newUser = new User(req.body);

    if (newUser.password != newUser.password2) return res.status(409).json({ error: "passwords do not match"});

    User.findOne({email: newUser.email}, (err, user) => {
        if (user) return res.status(409).json({ error: "email is already in use" });

        newUser.save((err, user) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).end();
        })
    })
});

router.post('/login', (req, res) => {
    const {email, password} = req.body;

    User.findOne({email}, (err, user) => {
        if (!user) return res.status(401).json({ error: "invalid credentials" });
        user.validatePassword(password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: "a server error has ocurred" });
            if (!isMatch) 
                return res.status(401).json({ error: "invalid credentials" });
            else {
                user.generateToken((err, user) => {
                    if (err) return res.status(500).json({ error: "a server error has ocurred" });
                    res
                    .status(200)
                    .cookie('auth', user.token, { 
                        expires: new Date(Date.now() + 1800000), 
                        httpOnly: true 
                    })
                    .end();
                });
            }
        })
    });
});

router.post('/logout', auth, (req, res) => {
    req.user.deleteToken((err, user) => {
        if (err) return res.status(500).json({ error: "a server error has ocurred" });
        res.status(204).end(); 
    });
});

module.exports = router;

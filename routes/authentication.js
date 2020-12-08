const express = require('express');
const User = require('./../models/User');
const { auth } = require('./../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 *
 * /signup:
 *      post:
 *          summary: Signup into the aplication
 *          tags: [Authentication]
 *          produces:
 *              - application/json
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              firstname:
 *                                  type: string
 *                              lastname:
 *                                  type: string
 *                              email:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                              password2:
 *                                  type: string
 *                          required:
 *                              - firstname
 *                              - lastname
 *                              - email
 *                              - password
 *                              - password2
 *          responses:
 *              201:
 *                  description: User created
 *              409:
 *                  description: Conflict. Passwords do not match or email already in use
 */
router.post('/singup', async (req, res) => {
    let newUser = new User(req.body);

    if (newUser.password != newUser.password2) return res.status(409).json({ error: "passwords do not match"});

    try {
        let user = await User.findOne({email: newUser.email});
        if (user) return res.status(409).json({ error: "email is already in use" });
        await newUser.save();
        res.status(201).end();
    }
    catch(err) {
        return res.status(500).json({ error: err });  
    }
});

/**
 * @swagger
 *
 * /login:
 *      post:
 *          summary: Login into the aplication
 *          tags: [Authentication]
 *          produces:
 *              - application/json
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              email:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                          required:
 *                              - email
 *                              - password
 *          responses:
 *              200:
 *                  description: User authenticated
 *                  
 *              401:
 *                  description: Invalid credentials. Incorrect email or password
 */
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

/**
 * @swagger
 *
 * /logout:
 *      post:
 *          summary: Logout from the aplication
 *          tags: [Authentication]
 *          produces:
 *              - application/json
 *          parameters:
 *              - name: auth
 *                in: cookie
 *                schema:
 *                  type: string
 *          responses:
 *              204:
 *                  description: User logged out succesfully
 */
router.post('/logout', auth, (req, res) => {
    req.user.deleteToken((err, user) => {
        if (err) return res.status(500).json({ error: "a server error has ocurred" });
        res.status(204).end(); 
    });
});

module.exports = router;

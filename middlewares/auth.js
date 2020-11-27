const User = require('./../models/User');

// authenticate the user with the token comming from a cookie
const auth = (req, res, next) => {
    const token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        req.token = token;
        req.user = user;
        next();
    });
}

module.exports = { auth };
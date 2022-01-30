const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err) return res.status(401).json({status: 'error', msg: 'token not valid'})

        const { email } = payload;
        req.user = {email};
        next()
    })
}

module.exports = {
    auth
}
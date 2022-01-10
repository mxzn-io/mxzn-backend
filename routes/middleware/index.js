const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        const { email } = payload;
        const ip = getIp(req);
        // token 正确，并且当前用户并未退出，并且此次携带的token是新token
        if(err || !(tokens[email]['ip'][ip]['accessToken'] === token)) return res.status(403).json({msg: 'token not valid'})
        req.user = payload;
        next()
    })
}

module.exports = {
    auth
}
const User = require('./../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let tokens = {};

const genToken = (user, ip, type) => {
    const { email } = user;
    switch (type) {
        case 'access':
            // 30分钟无操作，视为离线，需要刷新，
            if(ip !== 'localhost') {
                setTimeout(() => {
                    delete tokens[email]['ip'][ip]
                }, 1000 * 30)
            }
            return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ip === 'localhost' ? '30m': '30s'});
        case 'refresh':
            // 3天无操作，重新登录,刷新后，从当前时间点重新计算3天过期时间
            return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '3d'});
        default:
            return ''
    }
}

const getIp = (req) => {
    return req.headers['host'].split(':')[0] || '';
}

const genUsername = () => {
    return `user_${Math.random().toString(36).slice(-6)}`;
}

const login = (req, res) => {
    console.log('user login');
    const ip = getIp(req);
    const username = genUsername();
    const { email } = req.body;
    const user = { username, email };
    const accessToken = genToken(user, ip, 'access');
    const refreshToken = genToken(user, ip, 'refresh');

    // 允许同一个用户同时在多地登录
    if(!tokens[email]){
        tokens[email] = {}
    }

    if(!tokens[email]['ip']){
        tokens[email]['ip'] = {}
    }

    tokens[email]['username'] = username;
    tokens[email]['ip'][ip] = {accessToken, refreshToken}

    res.json({accessToken: accessToken, refreshToken: refreshToken})
}

const logout = (req, res) => {
    console.log('user logout')
    const { token } = req.body;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err) return res.status(403).json({msg: 'token not valid'});

        const ip = getIp();
        const { email } = payload;
        delete tokens[email]['ip'][ip];

        res.status(200).json({msg: 'logout successfully'});
    })
}

const token = (req, res) => {
    console.log('swap token')
    const { refreshToken } = req.body;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        const ip = getIp(req);
        const { username, email } = payload;
        const user = { username, email };

        // refreshToken 正确，并且当前用户并未退出
        if(err || !(tokens[email]['ip'][ip])) return res.status(403).json({msg: 'refresh token not valid'})
        const newAccessToken = genToken(user, ip, 'access')
        const newRefreshToken = genToken(user, ip, 'refresh')

        tokens[email]['ip'][ip]['accessToken'] = newAccessToken;
        tokens[email]['ip'][ip]['refreshToken'] = newRefreshToken;

        res.json({accessToken: newAccessToken, refreshToken: newRefreshToken})
    })
}

const userInfo = (req, res) => {
    res.json('userinfo')
}

const updateUser = (req, res) => {
   res.json('update userinfo')
}

module.exports = {
    login,
    token,
    logout,
    userInfo,
    updateUser
};
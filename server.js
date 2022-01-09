const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const app = express();
app.use(express.json());
dotenv.config();

const posts = [
    {
        username: 'Kyle'
    },
    {
        username: 'Jim'
    }
]

let tokens = {};

const generatToken = (user, type) => {
    switch (type) {
        case 'access':
            // 30分钟无操作，需要刷新，
            return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30m'});
        case 'refresh':
            // 3天无操作，重新登录,刷新后，从当前时间点重新计算3天过期时间
            return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '3d'});
        default:
            return ''
    }
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err || !(Object.keys(tokens).includes(payload.username) && tokens[payload.username]['accessToken'] === token)) return res.status(403).json({msg: 'token not valid'})
        req.user = payload;
        next()
    })
}

app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = {username: username}
    const accessToken = generatToken(user, 'access');
    const refreshToken = generatToken(user, 'refresh');
    // 同一时间只允许用户在一个地方登录.这里假设用户名是唯一的.

    tokens[username] = {}
    tokens[username]['accessToken'] = accessToken;
    tokens[username]['refreshToken'] = refreshToken;
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

app.delete('/logout', (req, res) => {
    jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err) return res.status(403).json({msg: 'token not valid'})
        delete tokens[payload.username]
        res.status(200).json({msg: 'logout successfully'})
    })
})

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if(err || !Object.keys(tokens).includes(payload.username)) return res.status(403).json({msg: 'refresh token not valid'})
        const newAccessToken = generatToken({username: payload.username}, 'access')
        const newRefreshToken = generatToken({username: payload.username}, 'refresh')
        tokens[payload.username] = {}
        tokens[payload.username]['accessToken'] = newAccessToken
        tokens[payload.username]['refreshToken'] = newRefreshToken;
        res.json({accessToken: newAccessToken, refreshToken: newRefreshToken})
    })
})

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.username))
})

app.listen(8001, () => {
    console.log("server is running")
});
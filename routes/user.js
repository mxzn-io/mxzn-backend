const express = require('express');
const router = express.Router();
const { auth } = require('./middleware/index');

const AuthController = require('../controllers/userCon');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/userinfo', auth, AuthController.userInfo);
router.put('/userinfo', auth, AuthController.updateUser);
router.post('/refreshToken', auth, AuthController.refreshToken);
router.delete('/logout', auth, AuthController.logout);

module.exports = router;
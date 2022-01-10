const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/userCon');

router.get('/userinfo', AuthController.userInfo);
router.put('/userinfo', AuthController.updateUser);
router.post('/login', AuthController.login);
router.post('/token', AuthController.token);
router.delete('/logout', AuthController.logout);

module.exports = router;
const express = require('express');
const router = express.Router();
const { auth } = require('./middleware/index')

const productCon = require('../controllers/productCon');

router.get('/list', auth, productCon.list);
router.post('/createProduct', auth, productCon.createProduct);

module.exports = router;
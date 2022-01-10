const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose')

// .env
dotenv.config();

// routes
const AuthRoute = require('./routes/user');
const ProductRoute = require('./routes/product');

// database
mongoose.connect(process.env.MONGO_URL ,() => {
    console.log('mongodb connected.')
    const app = express();
    app.use(express.json());

    app.use('/api/user', AuthRoute);
    app.use('/api/product', ProductRoute);

    // server
    app.listen(8000, '0.0.0.0', () => {
        console.log('server is running')
    })
}, error => {
    console.log('database error, something wrong!')
})
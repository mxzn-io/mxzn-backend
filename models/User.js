const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
}, {timestamps: true})

const User = mongoose.model('User', userSchema)

module.exports = User;
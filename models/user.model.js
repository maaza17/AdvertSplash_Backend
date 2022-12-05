const mongoose = require('mongoose')

// define user schema
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNum: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now(),
        required: true
    },
    userStatus: {
        type: String,
        enum: ['Registered', 'Active', 'Suspended'],
        default: 'Registered',
        required: true
    },
    confCode: {
        type: String,
        unqiue: true,
        required: true
    }
})
const userModel = mongoose.model('user', userSchema)
module.exports = userModel
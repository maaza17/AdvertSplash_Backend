const mongoose = require('mongoose')

// define admin schema
const adminSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now(),
        required: true
    }
})
const adminModel = mongoose.model('admin', adminSchema)
module.exports = adminModel
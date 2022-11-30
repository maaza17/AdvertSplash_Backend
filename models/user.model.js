const mongoose = require('mongoose')

// define user schema
const userSchema = new mongoose.Schema({})
const userModel = mongoose.model('user', userSchema)
module.exports = userModel
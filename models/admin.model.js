const mongoose = require('mongoose')

// define admin schema
const adminSchema = new mongoose.Schema({})
const adminModel = mongoose.model('admin', adminSchema)
module.exports = adminModel
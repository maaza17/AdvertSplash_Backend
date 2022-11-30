const mongoose = require('mongoose')

// define app schema
const appSchema = new mongoose.Schema({})
const appModel = mongoose.model('app', appSchema)
module.exports = appModel
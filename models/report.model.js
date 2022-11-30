const mongoose = require('mongoose')

// define report schema
const reportSchema = new mongoose.Schema({})
const reportModel = mongoose.model('report', reportSchema)
module.exports = reportModel
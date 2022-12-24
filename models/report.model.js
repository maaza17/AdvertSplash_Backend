const mongoose = require('mongoose')

// define report schema
const reportSchema = new mongoose.Schema({
    date: {
        type: Date
    },
    comID: {
        type: String,
        required: true
    },
    imressions: {
        type: Number,
        required: true
    },
    clicks: {
        type: Number,
        required: true
    },
    adRequests: {
        type: Number,
        required: true
    },
    ctr: {
        type: Number,
        required: true
    },
    cpm: {
        type: Number,
        required: true
    },
    revenue: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now()
    }
})
const reportModel = mongoose.model('report', reportSchema)
module.exports = reportModel
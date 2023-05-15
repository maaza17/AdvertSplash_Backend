const mongoose = require('mongoose')

// define report schema
const reportSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    appName: {
        type: String
    },
    comID: {
        type: String,
        required: true
    },
    dfpAdUnit: {
        type: String,
        required: true
    },
    adType: {
        type: String
    },
    exchangeRequests: {
        type: Number,
        required: true
    },
    matchedRequests: {
        type: Number,
        required: true
    },
    coverage: {
        type: Number,
        required: true
    },
    clicks: {
        type: Number,
        required: true
    },
    adRequestCTR: {
        type: Number,
        required: true
    },
    ctr: {
        type: Number,
        required: true
    },
    adCTR: {
        type: Number,
        required: true
    },
    cpc: {
        type: Number,
        required: true
    },
    adRequesteCPM: {
        type: Number,
        required: true
    },
    matchedeCPM: {
        type: Number,
        required: true
    },
    lift: {
        type: Number,
        required: true
    },
    estRevenue: {
        type: Number,
        required: true
    },
    adImpressions: {
        type: Number,
        required: true
    },
    adeCPM: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    clientEmail: {
        type: String,
        required: true
    }
})

const reportModel = mongoose.model('report', reportSchema)
module.exports = reportModel
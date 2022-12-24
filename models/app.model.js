const mongoose = require('mongoose')

// define app schema
const appSchema = new mongoose.Schema({
    appName: {
        type: String,
        required: true
    },
    appComID: {
        type: String,
        required: true
    },
    appType: {
        type: String,
        enum: ['Mobile', 'Web'],
        required: true,
        default: 'Mobile'
    },
    clientEmail: {
        type: String,
        required: true
    },
    appNiche: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now()
    }
})
const appModel = mongoose.model('app', appSchema)
module.exports = appModel
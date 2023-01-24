const router = require('express').Router();
const {verifyAdminTokenMiddleware, verifyUserTokenMiddleware} = require('../helpers/auth.helper');
const { emit } = require('../models/admin.model');
const appModel = require('../models/app.model');
const reportModel = require('../models/report.model')

// define routes here

// admin add new app for user
router.post('/addApplication', verifyAdminTokenMiddleware, (req, res) => {
    let {appName, appComID, appType, clientEmail, appNiche} = req.body

    newApp = new appModel({
        appName: appName,
        appComID: appComID,
        appType: appType,
        clientEmail: clientEmail,
        appNiche: appNiche
    })

    newApp.save()
    .then(result => {
        res.status(201).json({
            message: 'App added successfully.',
            data: result
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Error adding app.',
            error: err
        })
    })
})

router.get('/getAllApps', verifyAdminTokenMiddleware, (req, res) => {
    appModel.find()
    .then(result => {

        // remember to agregate and sum the count of ad unit IDs here and return in the response

        res.status(200).json({
            message: 'Apps retrieved successfully.',
            data: result
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Error retrieving apps.',
            error: err
        })
    })
})

router.post('/getAppsByUser_admin', verifyAdminTokenMiddleware, (req, res) => {
    let {clientEmail} = req.body
    appModel.find({clientEmail: clientEmail})
    .then(result => {

        // remember to agregate and sum the count of ad unit IDs here and return in the response

        res.status(200).json({
            message: 'Apps retrieved successfully.',
            data: result
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Could not get apps for user.',
            error: err
        })
    })
})

router.post('/getAppsByUser_user', verifyUserTokenMiddleware, (req, res) => {
    let {email} = req.body.decodedUser
    appModel.find({clientEmail: email})
    .then(result => {

        // remember to agregate and sum the count of ad unit IDs here and return in the response

        res.status(200).json({
            message: 'Apps retrieved successfully.',
            data: result
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    })
})

// GET unique mobile apps count
router.get('/getUniqueMobileAppsCount', verifyAdminTokenMiddleware, (req, res) => {
    appModel.countDocuments({appType: 'Mobile'})
    .then(count => {
        res.status(200).json({
            count: count
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    })
})

module.exports = router;
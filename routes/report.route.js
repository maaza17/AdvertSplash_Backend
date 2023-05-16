const router = require('express').Router();
const reportModel = require('../models/report.model');
const appModel = require('../models/app.model');
const { genConfCode, verifyUserTokenMiddleware, verifyAdminTokenMiddleware } = require('../helpers/auth.helper');
const { query } = require('express');
const isEmpty = require('is-empty');

// POST reportsUser
router.post('/reportsUser', verifyUserTokenMiddleware, async (req, res) => {
    // sample api call
    // localhost:7000/api/report/reportsUser/?filterApp=Live Cricket TV -Watch Matches|FightClub - Boxing UFC Live&filterStartDate=01-20-2023&filterEndDate=01-24-2023&filterAdTypes=Banner,App-Open&filterCountry=Pakistan&byApp=true&byDate=true&pageNum=1
    let { byApp, byDate, filterAdTypes, filterCountry, filterStartDate, filterEndDate, filterApp, pageNum } = req.query

    // set filterCriteria object
    let filterCriteria = { clientEmail: req.body.decodedUser.email }
    filterCirteria = !isEmpty(filterCountry) ? filterCriteria.country = { $in: filterCountry.split(',') } : filterCriteria
    filterCirteria = !isEmpty(filterAdTypes) ? filterCriteria.adType = { $in: filterAdTypes.split(',') } : filterCriteria
    filterCirteria = !isEmpty(filterApp) ? filterCriteria.appName = { $in: filterApp.split('|') } : filterCriteria
    if (!isEmpty(filterStartDate) && !isEmpty(filterEndDate)) {
        filterCriteria.date = {
            $gte: Date.parse(filterStartDate),
            $lte: Date.parse(filterEndDate)
        }
    } else if (!isEmpty(filterEndDate)) {
        filterCriteria.date = { $lte: Date.parse(filterEndDate) }
    } else if (!isEmpty(filterStartDate)) {
        filterCriteria.date = { $gte: Date.parse(filterStartDate) }
    }

    if (isEmpty(byApp) && isEmpty(byDate)) {
        reportModel.find(filterCriteria).sort({ 'date': -1 }).skip((parseInt(pageNum) - 1) * 100).limit(100)
            .then(reports => {
                return res.status(200).json({
                    reports: reports,
                    filterCriteria: filterCriteria
                })
            }).catch(err => {
                return res.status(500).json({
                    message: 'An unexpected error occurred. Please try again later.',
                    filterCriteria: filterCriteria
                })
            })
    } else {
        // set groupBy object
        let aggregateObj = {}
        if (!isEmpty(byApp)) {
            aggregateObj = {
                $group: {
                    _id: "$appName", adCount: { $addToSet: '$dfpAdUnit' }, exchangeRequests: { $sum: "$exchangeRequests" }, clicks: { $sum: "$clicks" }, adCTR: { $avg: "$adCTR" },
                    cpc: { $sum: "$cpc" }, lift: { $avg: "$lift" }, revenue: { $sum: "$estRevenue" }, adImpressions: { $sum: "$adImpressions" }, adeCPM: { $sum: "$adeCPM" }
                }
            }
        } else if (!isEmpty(byDate)) {
            aggregateObj = {
                $group: {
                    _id: "$date", adCount: { $addToSet: '$dfpAdUnit' }, exchangeRequests: { $sum: "$exchangeRequests" }, clicks: { $sum: "$clicks" }, adCTR: { $avg: "$adCTR" },
                    cpc: { $sum: "$cpc" }, lift: { $avg: "$lift" }, revenue: { $sum: "$estRevenue" }, adImpressions: { $sum: "$adImpressions" }, adeCPM: { $sum: "$adeCPM" }
                }
            }
        }

        reportModel.aggregate([
            { $match: filterCriteria },
            aggregateObj
        ]).sort({ 'date': -1 }).skip((parseInt(pageNum) - 1) * 100).limit(100)
            .then(reports => {
                return res.status(200).json({
                    reports: reports,
                    filterCriteria: filterCriteria,
                })
            }).catch(err => {
                return res.status(500).json({
                    message: 'An unexpected error occurred. Please try again later.',
                    err: err,
                    filterCriteria: filterCriteria
                })
            })
    }

})


// POST reportsAdmin
router.get('/reportsAdmin', verifyAdminTokenMiddleware, async (req, res) => {
    // sample api call
    // localhost:7000/api/report/reportsAdmin/?filterApp=Live Cricket TV -Watch Matches|FightClub - Boxing UFC Live&filterStartDate=01-20-2023&filterEndDate=01-24-2023&filterAdTypes=Banner,App-Open&filterCountry=Pakistan&byApp=true&byUser=true&byDate=true&pageNum=1
    let { byApp, byDate, byUser, filterAdTypes, filterCountry, filterStartDate, filterEndDate, filterApp, filterUser, pageNum } = req.query

    // set filterCriteria object
    let filterCriteria = {}
    filterCirteria = !isEmpty(filterCountry) ? filterCriteria.country = { $in: filterCountry.split(',') } : filterCriteria
    filterCirteria = !isEmpty(filterAdTypes) ? filterCriteria.adType = { $in: filterAdTypes.split(',') } : filterCriteria
    filterCirteria = !isEmpty(filterUser) ? filterCriteria.clientEmail = { $in: filterUser.split(',') } : filterCriteria
    filterCirteria = !isEmpty(filterApp) ? filterCriteria.appName = { $in: filterApp.split('|') } : filterCriteria
    if (!isEmpty(filterStartDate) && !isEmpty(filterEndDate)) {
        filterCriteria.date = {
            $gte: Date.parse(filterStartDate),
            $lte: Date.parse(filterEndDate)
        }
    } else if (!isEmpty(filterEndDate)) {
        filterCriteria.date = { $lte: Date.parse(filterEndDate) }
    } else if (!isEmpty(filterStartDate)) {
        filterCriteria.date = { $gte: Date.parse(filterStartDate) }
    }

    if (isEmpty(byApp) && isEmpty(byDate) && isEmpty(byUser)) {
        reportModel.find(filterCriteria).sort({ 'date': -1 }).skip((parseInt(pageNum) - 1) * 100).limit(100)
            .then(reports => {
                return res.status(200).json({
                    reports: reports,
                    filterCriteria: filterCriteria
                })
            }).catch(err => {
                return res.status(500).json({
                    message: 'An unexpected error occurred. Please try again later.',
                    filterCriteria: filterCriteria
                })
            })
    } else {
        // set groupBy object
        let aggregateObj = {}
        if (!isEmpty(byApp)) {
            aggregateObj = {
                $group: {
                    _id: "$appName", adCount: { $addToSet: '$dfpAdUnit' }, exchangeRequests: { $sum: "$exchangeRequests" }, clicks: { $sum: "$clicks" }, adCTR: { $avg: "$adCTR" },
                    cpc: { $sum: "$cpc" }, lift: { $avg: "$lift" }, revenue: { $sum: "$estRevenue" }, adImpressions: { $sum: "$adImpressions" }, adeCPM: { $sum: "$adeCPM" }
                }
            }
        } else if (!isEmpty(byDate)) {
            aggregateObj = {
                $group: {
                    _id: "$date", adCount: { $addToSet: '$dfpAdUnit' }, exchangeRequests: { $sum: "$exchangeRequests" }, clicks: { $sum: "$clicks" }, adCTR: { $avg: "$adCTR" },
                    cpc: { $sum: "$cpc" }, lift: { $avg: "$lift" }, revenue: { $sum: "$estRevenue" }, adImpressions: { $sum: "$adImpressions" }, adeCPM: { $sum: "$adeCPM" }
                }
            }
        } else if (!isEmpty(byUser)) {
            aggregateObj = {
                $group: {
                    _id: "$clientEmail", adCount: { $addToSet: '$dfpAdUnit' }, exchangeRequests: { $sum: "$exchangeRequests" }, clicks: { $sum: "$clicks" }, adCTR: { $avg: "$adCTR" },
                    cpc: { $sum: "$cpc" }, lift: { $avg: "$lift" }, revenue: { $sum: "$estRevenue" }, adImpressions: { $sum: "$adImpressions" }, adeCPM: { $sum: "$adeCPM" }
                }
            }
        }

        reportModel.aggregate([
            { $match: filterCriteria },
            aggregateObj
        ]).sort({ 'date': -1 }).skip((parseInt(pageNum) - 1) * 100).limit(100)
            .then(reports => {
                return res.status(200).json({
                    reports: reports,
                    filterCriteria: filterCriteria,
                })
            }).catch(err => {
                return res.status(500).json({
                    message: 'An unexpected error occurred. Please try again later.',
                    err: err,
                    filterCriteria: filterCriteria
                })
            })
    }

})

router.get('/getReportDropdownAdmin', verifyAdminTokenMiddleware, async (req, res) => {
    try {
        const types = await reportModel.aggregate([
            { $group: { _id: '$adType' } },

        ])
        const name = await reportModel.aggregate([
            { $group: { _id: '$appName' } },

        ])
        const country = await reportModel.aggregate([
            { $group: { _id: '$country' } },

        ])

        const users = await appModel.aggregate([
            { $group: { _id: '$clientEmail' } },
        ])

        let appTypes = types.map(dataByType => dataByType._id)
        let appNames = name.map(dataByName => dataByName._id)
        let appCountries = country.map(dataByCountry => dataByCountry._id)
        let appUsers = users.map(dataByUser => dataByUser._id)

        return res.status(200).json({
            types: appTypes,
            names: appNames,
            countries: appCountries,
            users: appUsers
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.',
            err: err
        })
    }

})

router.get('/getReportDropdownUser', verifyUserTokenMiddleware, async (req, res) => {
    try {
        const types = await reportModel.aggregate([
            { $group: { _id: '$adType' } },

        ])
        const name = await reportModel.aggregate([
            { $group: { _id: '$appName' } },

        ])
        const country = await reportModel.aggregate([
            { $group: { _id: '$country' } },

        ])

        let appTypes = types.map(dataByType => dataByType._id)
        let appNames = name.map(dataByName => dataByName._id)
        let appCountries = country.map(dataByCountry => dataByCountry._id)

        return res.status(200).json({
            types: appTypes,
            names: appNames,
            countries: appCountries
        })
    } catch (err) {
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.',
            err: err
        })
    }

})

// ---------------------------------------------------------------DASHBOARD APIS FOR ADMIN---------------------------------------------------------------

// GET aggregated clicks last 30 days admin
router.get('/aggregatedClicks', verifyAdminTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        { $match: { date: { $gte: { tempDate } } } },
        { $group: { _id: null, clicks: { $sum: "$clicks" } } }
    ])
        .then(data => {
            return res.status(200).json({
                clicks: (!isEmpty(data))?data[0].clicks:0
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// GET aggregated views last 30 days admin
router.get('/aggregatedViews', verifyAdminTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        { $match: { date: { $gte: { tempDate } } } },
        { $group: { _id: null, views: { $sum: "$adImpressions" } } }
    ])
        .then(data => {
            return res.status(200).json({
                views: (!isEmpty(data))?data[0].views:0
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.',
            })
        })
})

// Get aggregated CTR last 30 days admin
router.get('/aggregatedCTR', verifyAdminTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        { $match: { date: { $gte: { tempDate } } } },
        { $group: { _id: null, adCTR: { $avg: "$adCTR" } } }
    ])
        .then(data => {
            return res.status(200).json({
                adCTR: (!isEmpty(data))?data[0].adCTR:0
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// GET aggregated revenue last 30 days admin
router.get('/aggregatedRevenue', verifyAdminTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        { $match: { date: { $gte: { tempDate } } } },
        { $group: { _id: null, revenue: { $sum: "$estRevenue" } } }
    ])
        .then(data => {
            return res.status(200).json({
                clicks: (!isEmpty(data))?data[0].revenue:0
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// GET dashboard stats for graph- views, clicks, revenue, CTR across all time for graph admin
router.get('/dashboardStats', verifyAdminTokenMiddleware, async (req, res) => {
    reportModel.aggregate([
        { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, clicks: { $sum: "$clicks" }, views: { $sum: "$adImpressions" }, adCTR: { $avg: "$adCTR" }, revenue: { $sum: "$estRevenue" } } }
    ])
        .then(data => {
            return res.status(200).json({
                data: data
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// ---------------------------------------------------------------DASHBOARD APIS FOR USER---------------------------------------------------------------

// GET aggregated clicks last 30 days user
router.post('/aggregatedClicksUser', verifyUserTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        { $match: { date: { $gte: { tempDate } }, clientEmail: req.body.decodedUser.email } },
        { $group: { _id: null, clicks: { $sum: "$clicks" } } }
    ])
        .then(data => {
            return res.status(200).json({
                clicks: (!isEmpty(data))?data[0].clicks:0
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// GET aggregated views last 30 days user
router.post('/aggregatedViewsUser', verifyUserTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        { $match: { date: { $gte: { tempDate } }, clientEmail: req.body.decodedUser.email } },
        { $group: { _id: null, views: { $sum: "$adImpressions" } } }
    ])
        .then(data => {
            return res.status(200).json({
                views: (!isEmpty(data))?data[0].views:0
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.',
            })
        })
})

// Get aggregated CTR last 30 days user
router.post('/aggregatedCTRUser', verifyUserTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        { $match: { date: { $gte: { tempDate } }, clientEmail: req.body.decodedUser.email } },
        { $group: { _id: null, adCTR: { $avg: "$adCTR" } } }
    ])
        .then(data => {
            return res.status(200).json({
                adCTR: (!isEmpty(data))?data[0].adCTR:0
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// GET aggregated revenue last 30 days user
router.post('/aggregatedRevenueUser', verifyUserTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        { $match: { date: { $gte: { tempDate } }, clientEmail: req.body.decodedUser.email } },
        { $group: { _id: null, revenue: { $sum: "$estRevenue" } } }
    ])
        .then(data => {
            return res.status(200).json({
                clicks: (!isEmpty(data))?data[0].revenue:0
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// GET dashboard stats for graph- views, clicks, revenue, CTR across all time for graph user
router.post('/dashboardStatsUser', verifyUserTokenMiddleware, async (req, res) => {
    reportModel.aggregate([
        { $match: { clientEmail: req.body.decodedUser.email } },
        { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, clicks: { $sum: "$clicks" }, views: { $sum: "$adImpressions" }, adCTR: { $avg: "$adCTR" }, revenue: { $sum: "$estRevenue" } } }
    ])
        .then(data => {
            return res.status(200).json({
                data: data
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

module.exports = router;
const router = require('express').Router();
const reportModel = require('../models/report.model');
const {genConfCode, verifyUserTokenMiddleware, verifyAdminTokenMiddleware} = require('../helpers/auth.helper');
const { query } = require('express');
const isEmpty = require('is-empty');

// define routes here

// GET filtered and/or aggregated view - admin
router.get('/filteredReportsAdmin', verifyAdminTokenMiddleware, async (req, res) => {
    let {filterApp, filterStartDate, filterAdTypes, filterEndDate, filterCountry, aggregateByApp} = req.query

    // set filterCriteria object
    let filterCriteria = {}
    filterCirteria = !isEmpty(filterCountry)?filterCriteria.country = { $in: filterCountry.split(',') }:filterCriteria
    filterCirteria = !isEmpty(filterAdTypes)?filterCriteria.adType = { $in: filterAdTypes.split(',') }:filterCriteria
    filterCirteria = !isEmpty(filterApp)?filterCriteria.appName = { $in: filterApp.split(',') }:filterCriteria
    if(!isEmpty(filterStartDate) && !isEmpty(filterEndDate)){
        filterCriteria.date = {
            $gte: Date.parse(filterStartDate),
            $lte: Date.parse(filterEndDate)
        }
    } else if(!isEmpty(filterEndDate)){
        filterCriteria.date = { $lte: Date.parse(filterEndDate) }
    } else if(!isEmpty(filterStartDate)){
        filterCriteria.date = { $gte: Date.parse(filterStartDate)}
    }

    if(aggregateByApp){
        console.log('aggregated call')
        reportModel.aggregate([
            {$match: filterCriteria},
            {$group: {_id: "$appName", adCount: {$countUnique: '$dfpAdUnit'}, exchangeRequests: {$sum: "$exchangeRequests"}, matchedRequests: {$sum: "$matchedRequests"},
                    coverage: {$avg: "$coverage"}, clicks: {$sum: "$clicks"}, adRequestCTR: {$avg: "$adRequestCTR"}, ctr: {$avg: "$ctr"},
                    adCTR: {$avg: "$adCTR"},cpc: {$sum: "$cpc"}, adRequesteCPM: {$sum: "$adRequesteCPM"}, matchedeCPM: {$sum: "$matchedeCPM"},
                    lift: {$avg: "$lift"}, estRevenue: {$sum: "$estRevenue"}, adImpressions: {$sum: "$adImpressions"}, adeCPM: {$sum: "$adeCPM"}
                }
            }
        ])
        .then(reports => {
            return res.status(200).json({
                reports: reports,
                filterCriteria: filterCriteria,
                aggregated: true
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.',
                err: err,
                filterCriteria: filterCriteria,
                aggregated: true
            })
        })
    } else {
        reportModel.find(filterCriteria)
        .then(reports => {
            return res.status(200).json({
                reports: reports,
                filterCriteria: filterCriteria
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.',
                filterCriteria: filterCriteria
            })
        })
    }
})

// GET filtered and/or aggregated view - user
router.get('/filteredReportsUser', verifyUserTokenMiddleware, async (req, res) => {
    let {filterApp, filterStartDate, filterAdTypes, filterEndDate, filterCountry, aggregateByApp} = req.query

    // set filterCriteria object
    let filterCriteria = {}
    filterCirteria = !isEmpty(filterCountry)?filterCriteria.country = { $in: filterCountry.split(',') }:filterCriteria
    filterCirteria = !isEmpty(filterAdTypes)?filterCriteria.adType = { $in: filterAdTypes.split(',') }:filterCriteria
    filterCirteria = !isEmpty(filterApp)?filterCriteria.appName = { $in: filterApp.split(',') }:filterCriteria
    if(!isEmpty(filterStartDate) && !isEmpty(filterEndDate)){
        filterCriteria.date = {
            $gte: Date.parse(filterStartDate),
            $lte: Date.parse(filterEndDate)
        }
    } else if(!isEmpty(filterEndDate)){
        filterCriteria.date = { $lte: Date.parse(filterEndDate) }
    } else if(!isEmpty(filterStartDate)){
        filterCriteria.date = { $gte: Date.parse(filterStartDate)}
    }

    if(aggregateByApp){
        console.log('aggregated call')
        reportModel.aggregate([
            {$match: filterCriteria},
            {$group: {_id: "$appName", adCount: {$countUnique: '$dfpAdUnit'}, exchangeRequests: {$sum: "$exchangeRequests"}, matchedRequests: {$sum: "$matchedRequests"},
                    coverage: {$avg: "$coverage"}, clicks: {$sum: "$clicks"}, adRequestCTR: {$avg: "$adRequestCTR"}, ctr: {$avg: "$ctr"},
                    adCTR: {$avg: "$adCTR"},cpc: {$sum: "$cpc"}, adRequesteCPM: {$sum: "$adRequesteCPM"}, matchedeCPM: {$sum: "$matchedeCPM"},
                    lift: {$avg: "$lift"}, estRevenue: {$sum: "$estRevenue"}, adImpressions: {$sum: "$adImpressions"}, adeCPM: {$sum: "$adeCPM"}
                }
            }
        ])
        .then(reports => {
            return res.status(200).json({
                reports: reports,
                filterCriteria: filterCriteria,
                aggregated: true
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.',
                err: err,
                filterCriteria: filterCriteria,
                aggregated: true
            })
        })
    } else {
        reportModel.find(filterCriteria)
        .then(reports => {
            return res.status(200).json({
                reports: reports,
                filterCriteria: filterCriteria
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.',
                filterCriteria: filterCriteria
            })
        })
    }
})

// POST bulk upload reports

// POST delete reports - filtered

// GET aggregated clicks last 30 days
router.get('/aggregatedClicks', verifyAdminTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        {$match: {date: {$gte: {tempDate}}}},
        {$group: {_id: null, clicks: {$sum: "$clicks"}}}
    ])
    .then(data => {
        return res.status(200).json({
            clicks: data
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    })
})

// GET aggregated views last 30 days
router.get('/aggregatedViews', verifyAdminTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        {$match: {date: {$gte: {tempDate}}}},
        {$group: {_id: null, views: {$sum: "$adImpressions"}}}
    ])
    .then(data => {
        return res.status(200).json({
            views: data
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    })
})

// Get aggregated CTR last 30 days
router.get('/aggregatedCTR', verifyAdminTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        {$match: {date: {$gte: {tempDate}}}},
        {$group: {_id: null, ctr: {$avg: "$ctr"}}}
    ])
    .then(data => {
        return res.status(200).json({
            ctr: data
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    })
})

// GET aggregated revenue last 30 days
router.get('/aggregatedRevenue', verifyAdminTokenMiddleware, async (req, res) => {
    let tempDate = Date.now() - 2592000
    reportModel.aggregate([
        {$match: {date: {$gte: {tempDate}}}},
        {$group: {_id: null, revenue: {$sum: "$estRevenue"}}}
    ])
    .then(data => {
        return res.status(200).json({
            clicks: data
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    })
})

// GET dashboard stats for graph- views, clicks, revenue, CTR across all time for graph
router.get('/dashboardStats', verifyAdminTokenMiddleware, async (req, res) => {
    reportModel.aggregate([
        {$group: {_id: {year: {$year: "$date"}, month: {$month: "$date"}}, clicks: {$sum: "$clicks"}, views: {$sum: "$adImpressions"}, ctr: {$avg: "$ctr"}, revenue: {$sum: "$estRevenue"}}}
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
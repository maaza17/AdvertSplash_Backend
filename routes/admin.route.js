const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyAdminTokenMiddleware } = require('../helpers/auth.helper');
const adminModel = require('../models/admin.model');

// register admin
router.post('/register', async (req, res) => {
    let { fullname, email, password } = req.body;

    // validate inputs here

    let newAdmin = new adminModel({
        fullname: fullname,
        email: email,
        password: password
    })

    bcrypt.hash(newAdmin.password, 10, (hashErr, hash) => {
        if (hashErr) {
            res.status(500).json({
                message: 'An Unexpected error occurred. Please try again later',
            })
        }
        newAdmin.password = hash
        newAdmin.save()
            .then(data => {
                res.status(201).json({
                    message: 'Admin registered successfully'
                })
            })
            .catch(err => {
                if (err.code === 11000) {
                    res.status(409).json({
                        message: 'Admin already exists'
                    })
                } else {
                    res.status(500).json({
                        message: 'An Unexpected error occurred. Please try again later.'
                    })
                }
            })
    })
})

// login admin
router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    // validate inputs here

    adminModel.findOne({ email: email })
        .then(admin => {
            bcrypt.compare(password, admin.password)
                .then(isMatch => {
                    if (!isMatch) {
                        return res.status(401).json({
                            message: 'Invalid credentials'
                        })
                    } else {

                        let payload = {
                            _id: admin._id,
                            fullname: admin.fullname,
                            email: admin.email
                        }

                        jwt.sign(payload, process.env.ENCRYPTION_SECRET_ADMIN, { expiresIn: 172800 }, (signErr, token) => {
                            if (signErr) {
                                return res.status(500).json({
                                    message: 'An unexpected error occurred. Please try again later.'
                                })
                            }

                            return res.status(200).cookie('auth_token_adm', token, { httpOnly: true, secure: process.env.NODE_ENV == 'production', sameSite: "none" }).json({
                                message: "Login successful!",
                                adminName: admin.fullname
                            })
                        })
                    }
                })
        })
})

// logout admin
router.get('/logout', async (req, res) => {
    return res.status(200).clearCookie('auth_token_adm', { domain: "adsplashserver.vercel.app", path: "/", secure: process.env.NODE_ENV == 'production', sameSite: "none" }).json({
        message: 'Logout successful!'
    })
})

// request reset password

// request forgot password

// reset password

// check admin session
router.get('/checkAdminSession', verifyAdminTokenMiddleware, async (req, res) => {
    return res.status(200).json({
        message: 'Session is valid.'
    })
})

module.exports = router;
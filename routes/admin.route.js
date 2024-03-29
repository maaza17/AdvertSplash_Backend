const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyAdminTokenMiddleware } = require('../helpers/auth.helper');
const {sendForgotPasswordEmailAdmin} = require('../helpers/email.helper');
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
router.post('/logout', async (req, res) => {

    return res.status(200).clearCookie('auth_token_adm', { httpOnly: true, secure: process.env.NODE_ENV == 'production', sameSite: "none" }).json({
        message: 'Logout successful!'
    })
})

// request forgot password
router.post('/forgotPassword', async (req, res) => {
    let { email } = req.body
    adminModel.findOne({ email: email })
    .then(admin => {
        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found'
            })
        } else {
            let isSuccessful = sendForgotPasswordEmailAdmin(admin)
            if (isSuccessful) {
                return res.status(200).json({
                    message: 'An email has been sent to your email address. Please follow the link to reset your password.'
                })
            } else {
                return res.status(500).json({
                    message: 'An unexpected error occurred. Please try again later.'
                })
            }
        }
    })
    .catch(err => {
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    })
})

// reset forgotten password
router.post('/resetPassword_forgot/:tempToken', async (req, res) => {
    let { newPassOne, newPassTwo } = req.body
    let tempToken = req.params.tempToken

    if (newPassOne != newPassTwo) {
        return res.status(400).json({
            message: 'New passwords do not match.'
        })
    }

    try {
        let decoded = await jwt.verify(tempToken, process.env.ENCRYPTION_SECRET_ADMIN)
        let newPassFinal = await bcrypt.hash(newPassOne, 10)
        await adminModel.updateOne({ email: decoded.email }, { password: newPassFinal })
        .then(updated => {
            if(updated.attachedCount <= 0 || updated.modifiedCount <= 0) {
                return res.status(500).json({
                    message: 'An unexpected error occurred. Please try again later.'
                })
            } else {
                return res.status(200).json({
                    message: 'Password successfully reset.'
                })
            }
        })
    } catch (err) {
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    }
})

// reset password self
router.post('/resetPassword', verifyAdminTokenMiddleware, async (req, res) => {
    let { oldPass, newPass } = req.body
    adminModel.findOne({ email: "admin@advertsplash.com" })
        .then(Admin => {
            bcrypt.compare(oldPass, Admin.password)
                .then(isMatch => {
                    if (!isMatch) {
                        return res.status(200).json({
                            error: true,
                            message: 'Old password is incorrect. Please try again'
                        })
                    }
                })
                .then(() => {
                    // if (newPassOne === newPassTwo) {
                    bcrypt.hash(newPass, 10)
                        .then(newHash => {
                            adminModel.updateOne({ email: "admin@advertsplash.com" }, { password: newHash })
                                .then(updated => {
                                    if (updated.matchedCount <= 0 || updated.modifiedCount <= 0) {
                                        return res.status(500).json({
                                            message: 'An unexpected error occurred. Please try again later.'
                                        })
                                    } else {
                                        return res.status(200).json({
                                            message: 'Password reset successfully.'
                                        })
                                    }
                                })
                        })
                    // } else {
                    //     return res.status(400).json({
                    //         message: 'New passwords do not match.'
                    //     })
                    // }
                })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})


// check admin session
router.get('/checkAdminSession', verifyAdminTokenMiddleware, async (req, res) => {
    return res.status(200).json({
        message: 'Session is valid.'
    })
})

module.exports = router;
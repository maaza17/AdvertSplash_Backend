const router = require('express').Router();
const userModel = require('../models/user.model');
const { genConfCode, verifyUserTokenMiddleware, verifyAdminTokenMiddleware } = require('../helpers/auth.helper')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { sendAccountVerificationEmail, sendForgotPasswordEmailUser } = require('../helpers/email.helper');
const reportModel = require('../models/report.model');
const appModel = require('../models/app.model');

// register user
router.post('/register', async (req, res) => {
    let { fullname, email, phoneNum, password } = req.body

    // validate user inputs here


    let newUser = new userModel({
        fullname: fullname,
        email: email,
        phoneNum: phoneNum,
        password: password,
        confCode: genConfCode()
    })

    // hash user provided password here
    bcrypt.hash(newUser.password, 10)
        .then(hash => {
            newUser.password = hash
            newUser.save()
                .then(savedUser => {
                    console.log(savedUser);
                    emailSuccess = sendAccountVerificationEmail(savedUser)
                    if (emailSuccess) {
                        return res.status(201).json({
                            message: 'User registration successful. Kindly verify your provided email address.'
                        })
                    } else {
                        return res.status(500).json({
                            message: 'User registration successful. Contact Team AdvertSplash for account activation.'
                        })
                    }
                })
                .catch(saveErr => {
                    if (saveErr.code == 11000 && saveErr.keyPattern.email == 1) {
                        return res.status(400).json({
                            message: 'An account with email ' + saveErr.keyValue.email + ' already exists.'
                        })
                    }

                    return res.status(500).json({
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                })
        })
        .catch(hashErr => {
            return res.status(500).json({
                message: 'An unexpected error occurred while securing your password. Please try again.'
            })
        })
})

// login user
router.post('/login', async (req, res) => {
    let { email, password } = req.body

    // validate user provided inputs here

    // check is user exists
    userModel.findOne({ email: email })
        .then(user => {
            if (user.userStatus == 'Suspended') {
                return res.status(403).json({
                    message: 'Your account is suspended. Please contact portal admin for resolution.'
                })
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) {
                        return res.status(403).json({
                            message: 'Incorrect password.'
                        })
                    }

                    let payload = {
                        _id: user._id,
                        fullname: user.fullname,
                        email: user.email,
                        userStatus: user.userStatus
                    }

                    jwt.sign(payload, process.env.ENCRYPTION_SECRET_USER, { expiresIn: 172800 }, (signErr, token) => {
                        if (signErr) {
                            return res.status(500).json({
                                message: 'An unexpected error occurred. Please try again later.'
                            })
                        }

                        return res.status(200).cookie('auth_token_usr', token, { httpOnly: true, secure: process.env.NODE_ENV == 'production', sameSite: "none" }).json({
                            message: "Login successful!",
                            userName: user.fullname,
                            userEmail: user.email,
                            userStatus: user.userStatus
                        })
                    })
                })
        })
        .catch(err => {
            return res.status(400).json({
                message: 'User does not exist.'
            })
        })

})

// logout user
router.post('/logout', async (req, res) => {
    return res.status(200).clearCookie('auth_token_usr', { httpOnly: true, secure: process.env.NODE_ENV == 'production', sameSite: "none" }).json({
        message: 'Logout successful!'
    })
})

// get all users
router.post('/getAll', verifyAdminTokenMiddleware, async (req, res) => {
    userModel.find()
        .sort({ fullname: 1 }).limit(20).skip(Number(req.body.paginate - 1) * 20)
        .then(users => {
            if (users.length <= 0) {
                return res.status(200).json({
                    message: 'No users found.'
                })
            }

            appModel.aggregate([
                {$group: {_id: "$clientEmail", appArr: {$addToSet: '$appComID'}}}
            ]).then(apps => {
                data = users.map(user => {
                    let userApps = apps.filter(app => app._id == user.email)[0]
                    let temp = user._doc
                    temp.appCount = (apps.filter(app => app._id == user.email)[0]) ? apps.filter(app => app._id == user.email)[0].appArr.length : 0
                    return temp
                })

                return res.status(200).json({
                    message: 'Users found.',
                    data: data
                })
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// suspend user - limited to admin
router.post('/suspendUser', verifyAdminTokenMiddleware, async (req, res) => {
    let userEmail = req.body.email
    await userModel.updateOne({ email: userEmail, userStatus: 'Active' }, { userStatus: 'Suspended' })
        .then(suspendedUser => {
            // console.log(suspendedUser)
            if (suspendedUser.matchedCount <= 0) {
                return res.status(400).json({
                    message: 'User not found.'
                })
            } else if (suspendedUser.modifiedCount <= 0) {
                return res.status(400).json({
                    message: 'User already suspended.'
                })
            } else {
                return res.status(200).json({
                    message: 'User suspended successfully.'
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// verify email
router.post('/verifyEmail', (req, res) => {
    let confCode = req.body.confCode
    userModel.findOne({ confCode: confCode }, (err, doc) => {
        if (doc) {
            if (doc.userStatus === 'Registered') {
                doc.userStatus = 'Active'
                doc.save((err, savedDoc) => {
                    if (savedDoc) {
                        return res.status(200).json({
                            message: 'Email verified successfully.',
                            number: 5000
                        })
                    } else {
                        return res.status(200).json({
                            message: 'There was a problem saving your user. \n Please contact support or try again later',
                            number: 8000
                        })
                    }
                })
            } else {
                return res.status(200).json({
                    message: 'User already registered.',
                    number: 5000
                })
            }
        } else {
            return res.status(200).json({
                message: 'There was a problem finding your user. \n Please contact support or try again later',
                number: 8000
            })
        }
    })
})

// request forgot password
router.post('/forgotPassword', async (req, res) => {
    let {email} = req.body
    try{
        let user = await userModel.findOne({email: email})
        if(!user) {
            return res.status(404).json({
                message: 'User with this email not found.'
            })
        }

        let isSuccessful = sendForgotPasswordEmailUser({email: user.email, fullname: user.fullname, confCode: user.confCode})
        console.log(isSuccessful)
        if(isSuccessful) {
            return res.status(200).json({
                message: 'An email has been sent to your email address. Please follow the link to reset your password.'
            })
        } else {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        }

    } catch (err) {
        // console.log(err)
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.'
        })
    }
})

// reset forgotten password
router.post('/resetPassword_forgot/:tempToken', async (req, res) => {
    let { newPassOne, newPassTwo } = req.body
    console.log(req.body);
    let tempToken = req.params.tempToken

    if (newPassOne != newPassTwo) {
        return res.status(400).json({
            message: 'New passwords do not match.'
        })
    }

    try {
        let decoded = await jwt.verify(tempToken, process.env.ENCRYPTION_SECRET_USER)
        let newPassFinal = await bcrypt.hash(newPassOne, 10)
        await userModel.updateOne({ confCode: decoded.confCode }, { password: newPassFinal, confCode: genConfCode() })
        .then(updated => {
            if(updated.atchedCount <= 0 || updated.modifiedCount <= 0) {
                return res.status(500).json({
                    message: 'An unexpected error occurred. Please try again later1.'
                })
            } else {
                return res.status(200).json({
                    message: 'Password successfully reset.'
                })
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later2.'
        })
    }
})

// reset password self
router.post('/resetPassword', verifyUserTokenMiddleware, async (req, res) => {
    let { oldPass, newPassOne, newPassTwo } = req.body
    userModel.findOne({ email: req.body.decodedUser.email })
        .then(user => {
            bcrypt.compare(oldPass, user.password)
                .then(isMatch => {
                    if (!isMatch) {
                        return res.status(403).clearCookie('auth_token_usr', { httpOnly: true, secure: process.env.NODE_ENV == 'production', sameSite: "none" }).json({
                            message: 'Old password is incorrect. You will be logged out for security purposes. Kindly reset your password from the \'Forgot Password?\' option.'
                        })
                    }
                })
                .then(() => {
                    if (newPassOne === newPassTwo) {
                        bcrypt.hash(newPassOne, 10)
                            .then(newHash => {
                                userModel.updateOne({ email: req.body.decodedUser.email }, { password: newHash, confCode: genConfCode() })
                                    .then(updated => {
                                        if (updated.matchedCount <= 0 || updated.modifiedCount <= 0) {
                                            return res.status(500).json({
                                                message: 'An unexpected error occurred. Please try again later.'
                                            })
                                        } else {
                                            return res.status(200).clearCookie('auth_token_usr', { httpOnly: true, secure: process.env.NODE_ENV == 'production', sameSite: "none" }).json({
                                                message: 'Password reset successfully. Please sign-in again with your updated credentials.'
                                            })
                                        }
                                    })
                            })
                    } else {
                        return res.status(400).json({
                            message: 'New passwords do not match.'
                        })
                    }
                })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})


// add user - limited to admin - force register
router.post('/register_admin', async (req, res) => {
    let { fullname, percentage, email, phoneNum, password } = req.body

    let newUser = new userModel({
        fullname: fullname,
        email: email,
        phoneNum: phoneNum,
        password: password,
        percentage: (percentage) ? percentage : 0,
        confCode: genConfCode()
    })

    // hash user provided password here
    bcrypt.hash(newUser.password, 10)
        .then(hash => {
            newUser.password = hash
            newUser.save()
                .then(savedUser => {
                    emailSuccess = sendAccountVerificationEmail(savedUser)
                    if (emailSuccess) {
                        return res.status(201).json({
                            message: 'User registration successful. Kindly verify your provided email address.'
                        })
                    } else {
                        return res.status(500).json({
                            message: 'User registration successful. Contact Team AdvertSplash for account activation.'
                        })
                    }
                })
                .catch(saveErr => {
                    if (saveErr.code == 11000 && saveErr.keyPattern.email == 1) {
                        return res.status(400).json({
                            message: 'An account with email ' + saveErr.keyValue.email + ' already exists.'
                        })
                    } else return res.status(500).json({
                        message: 'An unexpected error occurred. Please try again later.'
                    })
                })
        })
        .catch(hashErr => {
            return res.status(500).json({
                message: 'An unexpected error occurred while securing your password. Please try again.'
            })
        })
})

// delete user - limited to admin - hard delete - delete all associated entities (apps, reports)
router.post('/deleteUser_admin', verifyAdminTokenMiddleware, async (req, res) => {
    let userEmail = req.body.email
    await userModel.deleteOne({ email: userEmail })
        .then(deletedUser => {

            // console.log(deletedUser)

            // delete all associated entities here

            if (deletedUser.deletedCount <= 0) {
                return res.status(400).json({
                    message: 'User not found.'
                })
            }

            return res.status(200).json({
                message: 'User deleted'
            })
        })
})

// restore user - limited to admin
router.post('/restoreUser', verifyAdminTokenMiddleware, async (req, res) => {
    let userEmail = req.body.email
    // console.log(req.body);
    userModel.updateOne({ email: userEmail, userStatus: 'Suspended' }, { $set: { userStatus: 'Active' } })
        .then(restoredUser => {
            if (restoredUser.matchedCount <= 0) {
                return res.status(400).json({
                    message: 'User not found.'
                })
            }

            return res.status(200).json({
                message: 'User restored successfully.'
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})

// check user session
router.get('/checkUserSession', verifyUserTokenMiddleware, async (req, res) => {
    return res.status(200).json({
        message: 'Session is valid.'
    })
})

// GET unique user count
router.get('/getUniqueUserCount', verifyAdminTokenMiddleware, async (req, res) => {
    userModel.countDocuments({ userStatus: 'Active' })
        .then(count => {
            return res.status(200).json({
                count: count
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: 'An unexpected error occurred. Please try again later.'
            })
        })
})
module.exports = router;
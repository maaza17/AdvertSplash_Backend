const router = require('express').Router();
const userModel = require('../models/user.model');
const {genConfCode, verifyUserTokenMiddleware, verifyAdminTokenMiddleware} = require('../helpers/auth.helper')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {sendAccountVerificationEmail} = require('../helpers/aws-ses.helper')

// register user
router.post('/register', async (req, res) => {
    let {fullname, email, phoneNum, password} = req.body
    
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

            emailSuccess = sendAccountVerificationEmail(savedUser)
            if(emailSuccess){
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
            if(saveErr.code == 11000 && saveErr.keyPattern.email == 1){
                return res.status(400).json({
                    message: 'An account with email ' + saveErr.keyValue.email + ' already exists.'
                })
            }

            return res.status(500).json({
                message: 'An unexpected error occured. Please try again later.'
            })
        })
    })
    .catch(hashErr => {
            return res.status(500).json({
                message: 'An unexpected error occured while securing your password. Please try again.'
            })
    })
})

// login user
router.post('/login', async (req, res) => {
    let {email, password} = req.body

    // validate user provided inputs here

    // check is user exists
    userModel.findOne({email: email})
    .then(user => {
        if(user.userStatus == 'Suspended'){
            return res.status(403).json({
                message: 'Your account is suspended. Please contact portal admin for resolution.'
            })
        }

        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if(!isMatch){
                return res.status(403).json({
                    message: 'Incorrect password.'
                })
            }

            let payload = {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                userStatus: user.userStatus,
                confCode: user.confCode
            }

            jwt.sign(payload, process.env.ENCRYPTION_SECRET_USER, {expiresIn: 172800}, (signErr, token) => {
                if(signErr){
                    return res.status(500).json({
                        message: 'An unexpected error occured. Please try again later.'
                    })
                }

                return res.status(200).cookie('auth_token_usr', token, {httpOnly: true, secure: process.env.NODE_ENV == 'production'}).json({
                    message: "Login successful!"
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
router.get('/logout', async (req, res) => {
    return res.status(200).clearCookie('auth_token_usr').json({
        message: 'Logout successful!'
    })
})

// get all users
router.post('/getAll', verifyAdminTokenMiddleware, async (req, res) => {
    userModel.find()
    .sort({fullname: 1}).limit(20).skip(Number(req.body.paginate-1)*20)
    .then(users => {
        if(users.length <= 0){
            return res.status(200).json({
                message: 'No users found.'
            })
        }

        return res.status(200).json({
            message:'Users found.',
            data: users
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'An unexpected error occured. Please try again later.'
        })
    })
})

// verify email

// reset password

// forgot password

// delete user - limited to admin - hard delete

// restore user - limited to admin

module.exports = router;
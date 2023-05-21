const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const transport = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: true,
    tls: { rejectUnauthorized: true },
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

// send account verification email - remember to change html in body
const sendAccountVerificationEmail = async (user) => {

    let mailOptions = {
        from: '"AdvertSplash" <' + process.env.NODEMAILER_EMAIL + '>',
        to: user.email,
        subject: 'Email Verificaion - AdvertSplash',
        html: '<h3>Hi '+user.fullname+'!</h3><br/><p>Thankyou for registering with AdvertSplash.</p><br/><p>Follow the link to verify your email address on our platform. Email verification helps us filter out spam and provide you with the best user experience.</p><br/><p><a href='+'https://ads.walzixdigitals.com/UserVerify?code='+user.confCode+'>Verify Account<a/></p><br/><p>Regards,<br/>Team AdvertSplash</p>'
    }

    await transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err)
            return false
        } else {
            console.log(info)
            return true
        }
    })
}

// send forgot password email - admin
const sendForgotPasswordEmailAdmin = async (admin) => {

    await jwt.sign({ email: admin.email, fullname: admin.fullname }, process.env.ENCRYPTION_SECRET_ADMIN, { expiresIn: 600 }, async (signErr, tempToken) => {

        if(signErr) {
            console.log(signErr)
            return false
        } else {
            let mailOptions = {
                from: '"AdvertSplash" <' + process.env.NODEMAILER_EMAIL + '>',
            to: admin.email,
            subject: 'Reset Your Password - AdvertSplash',
            html: `<h3>Hi ${admin.fullname}!</h3><br/><p>You recently requested to reset your password with us.</p><br/><p>Please Follow the link to reset your password on our platform. Note that this link is valid for 10 minutes only.</p><br/><p><a href=${process.env.FRONTEND_URL}/ResetAdminPassword?code=${tempToken}>ResetPassword<a/></p><br/><p>Regards,<br/>Team AdvertSplash</p>`
            }
            await transport.sendMail(mailOptions, (mailErr, mailInfo) => {
                if (mailErr) {
                    // console.log(mailErr)
                    return false
                } else {
                    // console.log(mailInfo)
                    return true
                }
            })
        }
    })
}


// send forgot password email - user
const sendForgotPasswordEmailUser = async (user) => {
    // console.log(user)

    await jwt.sign({ confCode: user.confCode }, process.env.ENCRYPTION_SECRET_USER, { expiresIn: 600 }, async (signErr, tempToken) => {

        if(signErr) {
            console.log(signErr)
            return false
        } else {
            let mailOptions = {
                from: '"AdvertSplash" <' + process.env.NODEMAILER_EMAIL + '>',
            to: user.email,
            subject: 'Reset Your Password - AdvertSplash',
            html: `<h3>Hi ${user.fullname}!</h3><br/><p>You recently requested to reset your password with us.</p><br/><p>Please Follow the link to reset your password on our platform. Note that this link is valid for 10 minutes only.</p><br/><p><a href=${process.env.FRONTEND_URL}/ResetUserPassword?code=${tempToken}>ResetPassword<a/></p><br/><p>Regards,<br/>Team AdvertSplash</p>`
            }
            await transport.sendMail(mailOptions, (mailErr, mailInfo) => {
                if (mailErr) {
                    // console.log(mailErr)
                    return false
                } else {
                    // console.log(mailInfo)
                    return true
                }
            })
        }
    })
}


module.exports = {
    sendAccountVerificationEmail: sendAccountVerificationEmail,
    sendForgotPasswordEmailAdmin: sendForgotPasswordEmailAdmin,
    sendForgotPasswordEmailUser: sendForgotPasswordEmailUser
}
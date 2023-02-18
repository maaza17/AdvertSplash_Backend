const AWS = require('aws-sdk')

const SES = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION
})

// send account verification email - remember to change html in body
const sendAccountVerificationEmail = async (user) => {

    let params = {
        Destination: {ToAddresses: [user.email]},
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: '<h3>Hi '+user.fullname+'!</h3><br/><p>Thankyou for registering with AdvertSplash.</p><br/><p>Follow the link to verify your email address on our platform. Email verification helps us filter out spam and provide you with the best user experience.</p><br/><p><a href='+'https://ads.walzixdigitals.com/UserVerify?code='+user.confCode+'>Verify Account<a/></p><br/><p>Regards,<br/>Team AdvertSplash</p>'
                },
                Text: {
                    Charset: "UTF-8",
                    Data: 'Hi  '+ user.fullname+'!'
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: `TEST EMAIL - AWS SES`
            }
        },
        Source: "AdvertSplash <" + process.env.AWS_FROM_EMAIL + ">", /* required */
        ReplyToAddresses: []  /* required */
    }

    await SES.sendEmail(params).promise()
    .then(data => {
        return true
    })
    .catch(err => {
        console.log(err)
        return fasle
    })
}

// send password reset email

// send forgot password email


module.exports = {
    sendAccountVerificationEmail: sendAccountVerificationEmail
}
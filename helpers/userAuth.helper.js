const jwt = require('jsonwebtoken');

// function to generate unique confirmation code for user registeration
function genConfCode() {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';
    let token = '';
    for (let i = 0; i < 30; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }
    return token
}

const verifyUserTokenMiddleware = (req, res, next) => {
    let token = req.cookies.access_token

    if(!token){
        return res.status(403).json({
            message: 'Access denied. No token provided.'
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.decodedUser = decoded
        next()
    } catch(err){
        return res.status(401).json({
            message: 'Session expired. Please login again.'
        })
    }
}

module.exports = {
    genConfCode: genConfCode
}
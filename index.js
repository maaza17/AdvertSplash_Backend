const express = require('express')
const mongoose = require('mongoose')
const compression = require('compression')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require("dotenv").config();

const adminRoute = require('./routes/admin.route')
const appRoute = require('./routes/app.route')
const reportRoute = require('./routes/report.route')
const userRoute = require('./routes/user.route')

const app = express();

app.use(bodyParser.json({limit: 20000000}));
app.use(cookieParser())


app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(cors({origin: process.env.FRONTEND_ORIGIN, credentials: true}))

app.use(compression({
  level: 6,
  threshold: 0
}))
 
mongoose
  .connect(
    process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.log(err));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} ${Date().toString()}`)
    next()
})

app.get('/', (req, res) => {
    return res.status(200).json({
        message: 'Welcome to the API'
    })
})

app.use('/api/admin', adminRoute)
app.use('/api/app', appRoute)
app.use('/api/report', reportRoute)
app.use('/api/users', userRoute)

const port = process.env.PORT || 7000;

app.listen(port,  () => {
    console.log('Server running on port ' + port)

})
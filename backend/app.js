const express = require('express')
const cors = require("cors")
const app = express()
const authRoute = require('./routes/auth')
const donorRoute = require('./routes/donor')
const hospitalRoute = require('./routes/hospital')
const prospectRoute = require('./routes/prospect')

module.exports = app;

//Cors
app.use(cors())

//json
app.use(express.json())

//Routes
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/donors', donorRoute)
app.use('/api/v1/hospitals', hospitalRoute)
app.use('/api/v1/prospects', prospectRoute)

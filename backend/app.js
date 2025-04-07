const express = require('express')
const cors = require("cors")
const app = express()
const authRoute = require('./routes/auth')

module.exports = app;

//Cors
app.use(cors())

//json
app.use(express.json())

//Routes
app.use('/api/v1/auth', authRoute)

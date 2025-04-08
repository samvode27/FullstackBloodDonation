const express = require("express")
const dotenv = require('dotenv');
const dbConnection = require("./utils/db");
const cron = require('node-cron');
dotenv.config()
const app = express()


//server
const PORT = process.env.PORT;

//schedule task
const run = () => {
  cron.schedule('* * * * *', () => {

  });
}

run();

app.listen(PORT, () => {
   console.log(`Backgroundservice is running on port ${PORT}`)    
   dbConnection()                                                                                                
})
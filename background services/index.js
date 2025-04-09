const express = require("express")
const dotenv = require('dotenv');
const dbConnection = require("./utils/db");
const cron = require('node-cron');
const { sendDetailsProspectEmail } = require("./EmailServices/sendDetailsPropect");
const { sendEligibilityEmail } = require("./EmailServices/sendEligibilityEmail");
const { sendDonorDetailsEmail } = require("./EmailServices/sendDonorDetailsEmail");
const { sendBloodDonationReminder } = require("./EmailServices/sendBloodDonationReminder");
dotenv.config()
const app = express()


//server
const PORT = process.env.PORT;

//schedule task
const run = () => {
  cron.schedule('* * * * *', () => {
    sendDetailsProspectEmail();
    sendEligibilityEmail();
    sendBloodDonationReminder();
    sendDonorDetailsEmail();
  });
}

run();

app.listen(PORT, () => {
   console.log(`Backgroundservice is running on port ${PORT}`)    
   dbConnection()                                                                                                
})
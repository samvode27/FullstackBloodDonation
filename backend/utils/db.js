const dotenv = require("dotenv");
const mongoose = require("mongoose")
dotenv.config()

//db
const DB = process.env.DB;

const dbConnection = async () => {
   try {
       await mongoose.connect(DB).then(() => {
          console.log('Databace Connected')
       })                                                                                           
   } catch (error) {
      console.log(error);
      setTimeout(dbConnection, 5000)
   }
}

module.exports = dbConnection;
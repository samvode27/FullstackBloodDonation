const mongoose = require("mongoose")

const donorSchema = mongoose.Schema({
   name: { type: String, required: true },  
   email: { type: String, required: true }, 
   address: { type: String }, 
   tel: { type: String }, 
   bloodgroup: { type: String }, 
   weight: { type: Number }, 
   date: { type: String }, 
   disease: { type: String }, 
   age: { type: Number }, 
   bloodpresure: { type: Number }, 
   status: { type: Number, default: 0 },                                                                                                 
}, {
   timestamp: true                                                                                                    
})

mongoose.exports = mongoose.model("Donor", donorSchema)
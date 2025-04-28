const mongoose = require("mongoose");

const hospitalSchema = mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String, required: true }, 
   address: { type: String }, 
   tel: { type: String }, 
   date: { type: String }, 
   status: { type: Number, default: 0 },                                                                                                 
}, {
   timestamps: true                                                                                                    
})

module.exports = mongoose.model("Hospital", hospitalSchema);

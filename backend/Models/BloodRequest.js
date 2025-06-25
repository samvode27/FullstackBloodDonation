const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
                                                                                                       
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },

  bloodGroup: { type: String, required: true },

  amount: { type: Number, required: true },

  caseDescription: { type: String, required: true },

  urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },

  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },

}, {
  timestamps: true,
});

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);

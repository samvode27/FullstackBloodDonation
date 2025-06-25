// models/donation.js

const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  amount: { type: Number, required: true },
  hospital: { type: String, required: false },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', donationSchema);

const mongoose = require("mongoose");

const hospitalSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: [true, 'Email must be unique'],
    minLength: [5, 'Email must have 5 characters'],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password must be provided'],
    trim: true,
    select: false
  },
  address: { type: String },
  tel: { type: String },
  date: { type: String },
  status: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },

  verificationCode: { type: String, select: false },
  verificationCodeValidation: { type: Number, select: false },
  forgotPasswordCode: { type: String, select: false },
  forgotPasswordCodeValidation: { type: Number, select: false },

  profileImage: { type: String } // used by upload
}, {
  timestamps: true
});

module.exports = mongoose.model("Hospital", hospitalSchema);

const mongoose = require('mongoose')

const donorSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: [true, 'Email must be unique'],
        minLength: [5, 'Email must have 5 charcters'],
        lowercase: true,
    },
    password: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: function (value) {
                console.log('📌 Password value during validation:', value);
                return typeof value === 'string' && value.length > 0;
            },
            message: 'Password must be provided'
        }
    },

    address: { type: String },

    tel: { type: String },

    dateOfBirth: Date,

    bloodgroup: { type: String },

    weight: { type: Number },

    donationAmount: {
        type: Number,
        required: true,
        default: 0
    },

    date: { type: String },

    disease: { type: String },

    age: { type: Number },

    bloodpresure: { type: Number },

    status: { type: Number, default: 0 },

    verified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false
    },
    verificationCodeValidation: {
        type: Number,
        select: false
    },
    forgotPasswordCode: {
        type: String,
        select: false
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false
    },

    profileImage: { type: String },

    donationHistory: [
        {
            amount: Number,
            date: Date,
            hospital: String,
            disease: String,
            bloodgroup: String,
            age: Number,
            weight: Number
        }
    ],

    rating: {
        type: Number,
        default: 0,
    },
    numberOfDonations: {
        type: Number,
        default: 0,
    },
    lastDonationDate: {
        type: Date,
        default: null
    },
    lastReminderDate: {
        type: Date,
        default: null
    },
    nextDonationDate: {
        type: Date,
        default: null
    },



}, {
    timestamps: true
});

module.exports = mongoose.models.Donor || mongoose.model('Donor', donorSchema);

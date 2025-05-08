// const mongoose = require("mongoose");

// const donorSchema = mongoose.Schema({
//     name:{type:String, require:true},
//     email:{type:String, require:true},
//     password:{type:String, require:true},
//     status:{type:Number, default:0},
//     role:{type:String}
// },{
// timestamp:true
// })

// module.exports = mongoose.model("Donor", donorSchema)


const mongoose = require('mongoose')

const donorSchema = mongoose.Schema({
    name: { type: String, require: true },
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
        required: [true, 'Password must be provided'],
        trim: true,
        select: false
    },
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
}, {
    timestamps: true
});

module.exports = mongoose.model('Donor', donorSchema)
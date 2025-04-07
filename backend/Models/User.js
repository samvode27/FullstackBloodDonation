const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: Number, default: 0 },
    role: { type: String, default: "admin" },  // Default role set to "admin"
}, {
    timestamps: true  // Corrected spelling
});

module.exports = mongoose.model("User", userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    googleId: { type: String },
    password: { type: String },
    role: {
        type: String,
        enum: ['User', 'Organiser', 'Admin'],
        default: 'User'
    },
    profileImage: { type: String },
    college: { type: String },
    department: { type: String },
    year: { type: String },
    registerNumber: { type: String },
    phoneNumber: { type: String },
    interestedAreas: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

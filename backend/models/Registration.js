const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamName: { type: String },
    teamMembers: [{
        name: { type: String },
        email: { type: String }
    }],
    status: { type: String, enum: ['Registered', 'Submitted', 'Waitlisted', 'Cancelled'], default: 'Registered' },
    pptSubmissionUrl: { type: String },
    submittedAt: { type: Date },
    attendanceVerified: { type: Boolean, default: false },
    certificateEligible: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent duplicate registrations for the same event by the same user
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);

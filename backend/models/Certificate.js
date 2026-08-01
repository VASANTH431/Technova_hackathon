const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    certificateId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    pdfUrl: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    qrCodeUrl: { type: String, required: true }
}, { timestamps: true });

// Prevent duplicate certificates per user per event
certificateSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);

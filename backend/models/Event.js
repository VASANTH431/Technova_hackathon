const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    eventType: { type: String, enum: ['Solo', 'Team'], required: true },
    topic: { type: String },
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String },
    bannerImage: { type: String },
    eventLogo: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationStart: { type: Date },
    registrationEnd: { type: Date },
    submissionDeadline: { type: Date },
    venue: { type: String },
    googleMapsLocation: { type: String },
    onlineMeetingLink: { type: String },
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organiserName: { type: String },
    organiserContact: { type: String },
    organiserEmail: { type: String },
    eventCapacity: { type: Number },
    eligibility: { type: String },
    requiredSkills: [{ type: String }],
    prizeDetails: { type: String },
    certificateAvailable: { type: Boolean, default: false },
    registrationFee: { type: Number, default: 0 },
    teamSize: {
        min: { type: Number, default: 1 },
        max: { type: Number, default: 1 }
    },
    pptRequired: { type: Boolean, default: false },
    pptTemplateUrl: { type: String },
    requiredDocuments: [{ type: String }],
    instructions: { type: String },
    faqs: [{
        question: { type: String },
        answer: { type: String }
    }],
    status: { type: String, enum: ['Draft', 'Published', 'Cancelled'], default: 'Draft' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

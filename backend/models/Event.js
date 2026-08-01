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
    instituteName: { type: String },
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
    certificateConfig: {
        enabled: { type: Boolean, default: false },
        templateUrl: { type: String },
        fields: [{
            name: { type: String },
            x: { type: Number },
            y: { type: Number },
            fontSize: { type: Number, default: 24 },
            color: { type: String, default: '#000000' },
            fontFamily: { type: String, default: 'Helvetica' },
            align: { type: String, default: 'left' }
        }]
    },
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
    status: { type: String, enum: ['Draft', 'Pending Approval', 'Published', 'Ongoing', 'Completed', 'Cancelled'], default: 'Draft' },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

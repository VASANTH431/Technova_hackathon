const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { authMiddleware, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/registrations/:eventId/register
// @desc    Register for an event and optionally upload PPT submission
// @access  Private (User)
router.post('/:eventId/register', authMiddleware, upload.single('pptSubmission'), async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.id;
        const { teamName } = req.body;
        let { teamMembers } = req.body;

        if (teamMembers && typeof teamMembers === 'string') {
            try {
                teamMembers = JSON.parse(teamMembers);
            } catch (e) {
                teamMembers = [];
            }
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Deadline check
        if (event.registrationEnd && new Date() > new Date(event.registrationEnd)) {
            return res.status(400).json({ error: 'Registration deadline has passed' });
        }

        const existingReg = await Registration.findOne({ event: eventId, user: userId });
        if (existingReg) return res.status(400).json({ error: 'You are already registered for this event' });

        const registration = new Registration({
            event: eventId,
            user: userId,
            teamName: teamName || null,
            teamMembers: teamMembers || []
        });

        if (req.file) {
            registration.pptSubmissionUrl = '/uploads/' + req.file.filename;
            registration.status = 'Submitted';
            registration.submittedAt = new Date();
        }

        await registration.save();
        res.status(201).json({ message: 'Successfully registered', registration });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/registrations/:eventId/submit
// @desc    Upload PPT for an event submission
// @access  Private (User)
router.post('/:eventId/submit', authMiddleware, upload.single('pptSubmission'), async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.id;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Deadline check
        if (event.submissionDeadline && new Date() > new Date(event.submissionDeadline)) {
            return res.status(400).json({ error: 'Submission deadline has passed' });
        }

        const registration = await Registration.findOne({ event: eventId, user: userId });
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found. Please register first.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a valid file' });
        }

        registration.pptSubmissionUrl = '/uploads/' + req.file.filename;
        registration.status = 'Submitted';
        registration.submittedAt = new Date();

        await registration.save();
        res.json({ message: 'Submission uploaded successfully', registration });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/registrations/event/:eventId
// @desc    Get all registrations for a specific event
// @access  Organiser / Admin
router.get('/event/:eventId', authMiddleware, restrictTo('Organiser', 'Admin'), async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // If organiser, ensure they own the event
        if (req.user.role === 'Organiser' && event.organiser.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const registrations = await Registration.find({ event: eventId }).populate('user', 'name email');
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/registrations/:id/eligibility
// @desc    Update attendance and certificate eligibility
// @access  Organiser / Admin
router.put('/:id/eligibility', authMiddleware, restrictTo('Organiser', 'Admin'), async (req, res) => {
    try {
        const { attendanceVerified, certificateEligible } = req.body;
        const registration = await Registration.findById(req.params.id).populate('event');

        if (!registration) return res.status(404).json({ error: 'Registration not found' });

        if (req.user.role === 'Organiser' && registration.event.organiser.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (attendanceVerified !== undefined) registration.attendanceVerified = attendanceVerified;
        if (certificateEligible !== undefined) registration.certificateEligible = certificateEligible;

        await registration.save();
        res.json(registration);
    } catch (error) {
        res.status(500).json({ error: 'Server error updating eligibility' });
    }
});

// @route   GET /api/registrations/my
// @desc    Get all registrations for the logged in user
// @access  Private (User)
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user.id }).populate('event');
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

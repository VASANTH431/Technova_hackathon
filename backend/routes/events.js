const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { authMiddleware, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/events
// @desc    Get all published events (or all for Admin/Organiser)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        let filter = {};
        // Users only see published or ongoing events. Admins and Organisers see all.
        if (req.user.role === 'User') {
            filter.status = { $in: ['Published', 'Ongoing'] };
        }

        const events = await Event.find(filter).sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve events' });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve event' });
    }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Organiser / Admin
router.post('/', authMiddleware, restrictTo('Organiser', 'Admin'), upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'pptTemplate', maxCount: 1 }, { name: 'certificateTemplate', maxCount: 1 }]), async (req, res) => {
    try {
        const eventData = req.body;

        if (req.files) {
            if (req.files.bannerImage) {
                eventData.bannerImage = '/uploads/' + req.files.bannerImage[0].filename;
            }
            if (req.files.pptTemplate) {
                eventData.pptTemplateUrl = '/uploads/' + req.files.pptTemplate[0].filename;
            }
            if (req.files.certificateTemplate) {
                if (!eventData.certificateConfig) eventData.certificateConfig = {};
                eventData.certificateConfig.templateUrl = '/uploads/' + req.files.certificateTemplate[0].filename;
            }
        }

        // Ensure organiser info is set
        eventData.organiser = req.user.id;

        // Handle nested or parsed data if coming from form-data
        if (eventData.teamSize && typeof eventData.teamSize === 'string') {
            eventData.teamSize = JSON.parse(eventData.teamSize);
        }

        const newEvent = new Event(eventData);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Organiser / Admin
router.put('/:id', authMiddleware, restrictTo('Organiser', 'Admin'), upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'pptTemplate', maxCount: 1 }, { name: 'certificateTemplate', maxCount: 1 }]), async (req, res) => {
    try {
        const eventId = req.params.id;
        let event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Only Admin or the owning Organiser can edit
        if (req.user.role !== 'Admin' && event.organiser.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to edit this event' });
        }

        const updates = req.body;

        if (req.files) {
            if (req.files.bannerImage) {
                updates.bannerImage = '/uploads/' + req.files.bannerImage[0].filename;
            }
            if (req.files.pptTemplate) {
                updates.pptTemplateUrl = '/uploads/' + req.files.pptTemplate[0].filename;
            }
            if (req.files.certificateTemplate) {
                if (typeof updates.certificateConfig === 'string') updates.certificateConfig = JSON.parse(updates.certificateConfig);
                if (!updates.certificateConfig) updates.certificateConfig = {};
                updates.certificateConfig.templateUrl = '/uploads/' + req.files.certificateTemplate[0].filename;
            }
        }

        if (updates.teamSize && typeof updates.teamSize === 'string') {
            updates.teamSize = JSON.parse(updates.teamSize);
        }

        if (updates.certificateConfig && typeof updates.certificateConfig === 'string') {
            updates.certificateConfig = JSON.parse(updates.certificateConfig);
            // Re-apply template URL if it was uploaded just now to avoid overwrite from stringified JSON
            if (req.files && req.files.certificateTemplate) {
                updates.certificateConfig.templateUrl = '/uploads/' + req.files.certificateTemplate[0].filename;
            }
        }

        event = await Event.findByIdAndUpdate(eventId, updates, { new: true });
        res.json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Admin (or owning Organiser)
router.delete('/:id', authMiddleware, restrictTo('Admin', 'Organiser'), async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (req.user.role !== 'Admin' && event.organiser.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error during deletion' });
    }
});

// @route   PUT /api/events/:id/complete
// @desc    Mark event as completed
// @access  Organiser / Admin
router.put('/:id/complete', authMiddleware, restrictTo('Organiser', 'Admin'), async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (req.user.role === 'Organiser' && event.organiser.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to complete this event' });
        }

        if (event.status !== 'Ongoing' && event.status !== 'Published') {
            return res.status(400).json({ error: 'Only Published or Ongoing events can be marked as completed' });
        }

        event.status = 'Completed';
        event.completedAt = new Date();
        await event.save();

        res.json({ message: 'Event marked as completed successfully', event });
    } catch (err) {
        res.status(500).json({ error: 'Server error marking event as completed' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const { authMiddleware, restrictTo } = require('../middleware/auth');

// Helper to safely get mapped field names
const getFieldValue = (fieldName, p, event) => {
    switch (fieldName) {
        case 'participant_name': return p.participantName || 'Participant';
        case 'event_name': return event.title;
        case 'organizer_name': return event.organiserName || 'Organizer';
        case 'date': return new Date(event.startDate).toLocaleDateString();
        case 'event_category': return event.category;
        default: return '';
    }
};

// @route   POST /api/certificates/generate/:eventId
// @desc    Generate certificates for eligible participants
// @access  Organiser / Admin
router.post('/generate/:eventId', authMiddleware, restrictTo('Organiser', 'Admin'), async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId).populate('organiser');

        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (req.user.role === 'Organiser' && event.organiser._id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (event.status !== 'Completed') {
            return res.status(400).json({ error: 'Event must be marked as Completed before certificates can be generated' });
        }

        if (!event.certificateConfig?.enabled || !event.certificateConfig?.templateUrl) {
            return res.status(400).json({ error: 'Certificates are not configured or enabled for this event' });
        }

        // Query to match root level eligibility OR any team member eligibility
        const eligibleRegistrations = await Registration.find({
            event: eventId,
            status: { $in: ['Registered', 'Submitted'] }
        }).populate('user');

        const certsDir = path.join(__dirname, '..', 'uploads', 'certificates');
        if (!fs.existsSync(certsDir)) {
            fs.mkdirSync(certsDir, { recursive: true });
        }

        const templatePath = path.join(__dirname, '..', event.certificateConfig.templateUrl);
        const templateBytes = fs.readFileSync(templatePath);

        let generatedCount = 0;

        // Flatten list of eligible participants
        let participantsToGenerate = [];
        for (const reg of eligibleRegistrations) {
            if (reg.attendanceVerified && reg.certificateEligible) {
                participantsToGenerate.push({
                    userObjId: reg.user._id,
                    participantName: reg.user.name,
                    participantEmail: reg.user.email,
                    certIdSuffix: reg.user._id.toString(),
                    isRootUser: true
                });
            }
            if (reg.teamMembers && reg.teamMembers.length > 0) {
                for (const member of reg.teamMembers) {
                    if (member.attendanceVerified && member.certificateEligible) {
                        const hash = require('crypto').createHash('md5').update(member.email || member.name || member._id?.toString() || 'unknown').digest('hex').substring(0, 24);
                        participantsToGenerate.push({
                            userObjId: hash,
                            participantName: member.name || 'Team Member',
                            participantEmail: member.email || '',
                            certIdSuffix: (member._id || hash).toString(),
                            isRootUser: false
                        });
                    }
                }
            }
        }

        for (const p of participantsToGenerate) {
            const existingCert = await Certificate.findOne({ event: eventId, user: p.userObjId });
            if (existingCert) {
                try {
                    const oldPath = path.join(__dirname, '..', existingCert.pdfUrl);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                } catch (e) {
                    console.error('Failed to cleanup old certificate file', e);
                }
                await existingCert.deleteOne();
            }

            const certId = uuidv4().split('-')[0].toUpperCase() + '-' + p.certIdSuffix.slice(-6);

            // Generate QR
            const verifyUrl = `${req.protocol}://${req.get('host')}/api/certificates/verify/${certId}`;
            const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

            // Determine if template is PDF or Image
            let pdfDoc;
            const ext = path.extname(templatePath).toLowerCase();

            if (ext === '.pdf') {
                pdfDoc = await PDFDocument.load(templateBytes);
            } else {
                pdfDoc = await PDFDocument.create();
                const page = pdfDoc.addPage([842, 595]); // Standard A4 Landscape

                let image;
                if (ext === '.png') {
                    image = await pdfDoc.embedPng(templateBytes);
                } else {
                    image = await pdfDoc.embedJpg(templateBytes);
                }

                page.drawImage(image, {
                    x: 0, y: 0,
                    width: page.getWidth(),
                    height: page.getHeight()
                });
            }

            const page = pdfDoc.getPages()[0];
            const { height: pageHeight } = page.getSize();

            // Overlay QR
            const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);
            page.drawImage(qrImage, {
                x: 40,
                y: 40,
                width: 80,
                height: 80,
            });

            // Embed the Professional Font
            const customFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            // Group fields by exact Y coordinate to prevent overlapping text elements
            const groupsByY = {};
            for (const field of event.certificateConfig.fields) {
                if (!groupsByY[field.y]) {
                    groupsByY[field.y] = { fields: [], x: field.x, fontSize: field.fontSize || 24 };
                }
                groupsByY[field.y].fields.push(field);
            }

            // Overlay Texts
            for (const yPos of Object.keys(groupsByY)) {
                const group = groupsByY[yPos];

                // Extract strings for this Y coordinate and join them by comma
                const strings = group.fields.map(field => {
                    let txt = field.name === 'certificate_id' ? certId : getFieldValue(field.name, p, event);
                    return txt || '';
                }).filter(t => t.length > 0);

                const joinedText = strings.join(', ');

                // Center align the joined text
                const textWidth = customFont.widthOfTextAtSize(joinedText, group.fontSize);
                const centeredX = group.x - (textWidth / 2);

                page.drawText(joinedText, {
                    x: centeredX,
                    y: Number(yPos),
                    size: group.fontSize,
                    font: customFont,
                    color: rgb(0, 0, 0)
                });
            }

            const pdfBytes = await pdfDoc.save();
            const pdfFilename = `cert_${certId}.pdf`;
            const pdfSavePath = path.join(certsDir, pdfFilename);
            fs.writeFileSync(pdfSavePath, pdfBytes);

            const certificate = new Certificate({
                certificateId: certId,
                user: p.userObjId,
                participantName: p.participantName,
                participantEmail: p.participantEmail,
                event: eventId,
                pdfUrl: `/uploads/certificates/${pdfFilename}`,
                qrCodeUrl: qrCodeDataUrl
            });
            await certificate.save();

            if (p.isRootUser) {
                const notification = new Notification({
                    user: p.userObjId,
                    title: 'Certificate Ready',
                    message: `🎉 Your certificate for ${event.title} is ready to download.`,
                    type: 'Certificate Ready',
                    actionUrl: `/my-certificates`
                });
                await notification.save();
            }

            generatedCount++;
        }

        res.json({ message: `Successfully generated ${generatedCount} certificates.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error generating certificates' });
    }
});

// @route   GET /api/certificates/my
// @desc    Get all certificates for logged in user
// @access  Private
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const certs = await Certificate.find({ user: req.user.id }).populate('event');
        res.json(certs);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching certificates' });
    }
});

// @route   GET /api/certificates/verify/:certificateId
// @desc    Public verification endpoint
// @access  Public
router.get('/verify/:certificateId', async (req, res) => {
    try {
        const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
            .populate('user', 'name')
            .populate('event', 'title organiserName');

        if (!cert) return res.status(404).json({ error: 'Certificate not found or invalid' });

        res.json({
            valid: true,
            participantName: cert.participantName || (cert.user ? cert.user.name : 'Participant'),
            eventName: cert.event.title,
            organizerName: cert.event.organiserName,
            issueDate: cert.issueDate,
            certificateId: cert.certificateId
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/certificates/status/:eventId
// @desc    Get certificate generation status for an event
// @access  Organiser / Admin
router.get('/status/:eventId', authMiddleware, restrictTo('Organiser', 'Admin'), async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const eligibleCount = await Registration.countDocuments({
            event: eventId,
            status: { $in: ['Registered', 'Submitted'] },
            attendanceVerified: true,
            certificateEligible: true
        });

        const generatedCount = await Certificate.countDocuments({ event: eventId });

        const pendingCount = Math.max(0, eligibleCount - generatedCount);

        res.json({
            totalEligible: eligibleCount,
            generatedCount,
            pendingCount,
            failedCount: 0 // Simplification since failed generate doesn't save to DB.
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching status' });
    }
});

// @route   GET /api/certificates/download-all/:eventId
// @desc    Download all generated certificates as a Zip
// @access  Organiser / Admin
router.get('/download-all/:eventId', authMiddleware, restrictTo('Organiser', 'Admin'), async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const certificates = await Certificate.find({ event: eventId });

        if (certificates.length === 0) {
            return res.status(404).json({ error: 'No certificates found for this event' });
        }

        const archive = archiver('zip', { zlib: { level: 9 } });

        res.attachment(`certificates-${eventId}.zip`);
        archive.pipe(res);

        for (const cert of certificates) {
            const filename = cert.pdfUrl.split('/').pop();
            const filePath = path.join(__dirname, '..', 'uploads', 'certificates', filename);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: filename });
            }
        }

        await archive.finalize();
    } catch (error) {
        console.error("ZIP Error: ", error);
        res.status(500).json({ error: 'Server error generating zip' });
    }
});

module.exports = router;

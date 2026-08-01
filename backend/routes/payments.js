const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const Registration = require('../models/Registration');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET',
});

// Create Order API
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;

        const options = {
            amount: amount * 100, // amount in smallest currency unit (e.g., paise)
            currency: currency || "INR",
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {}
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).send("Error creating order");
        }

        res.status(200).json(order);
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        const errorDesc = err.error ? err.error.description : err.message;
        res.status(500).json({
            error: "Something went wrong while creating order",
            message: errorDesc || "Unknown Razorpay error, please check backend logs.",
            details: err
        });
    }
});

// Verify Payment API
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET';
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Database operation: update order status to paid, save payment ID, etc.
            // Example: await Order.findOneAndUpdate({ orderId: razorpay_order_id }, { status: 'Paid', paymentId: razorpay_payment_id });

            res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (err) {
        console.error("Error verifying payment:", err);
        res.status(500).json({ error: "Something went wrong during payment verification", details: err });
    }
});

// Razorpay Webhook Endpoint
router.post('/webhook', async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'YOUR_RAZORPAY_WEBHOOK_SECRET';

        // We use req.rawBody which we captured in server.js to ensure the signature matches perfectly
        const body = req.rawBody;
        const signature = req.headers['x-razorpay-signature'];

        // Use Razorpay utility to validate the signature
        const isValid = Razorpay.validateWebhookSignature(body, signature, secret);

        if (isValid) {
            console.log("Webhook signature is valid!");

            // Process the event
            const event = req.body.event;
            const payload = req.body.payload;

            if (event === 'payment.captured') {
                const payment = payload.payment.entity;
                console.log("✅ Payment captured successfully for Order:", payment.order_id);
                // 🚀 TODO: Update database Registration model
                // Example: await Registration.findOneAndUpdate({ orderId: payment.order_id }, { paymentStatus: 'Paid' });
            } else if (event === 'payment.failed') {
                const payment = payload.payment.entity;
                console.log("❌ Payment failed for Order:", payment.order_id);
                // 🚀 TODO: Handle failed payment in database
            }

            // Acknowledge receipt to Razorpay so it stops retrying
            res.status(200).json({ status: 'ok' });
        } else {
            console.error("Invalid Webhook Signature!");
            res.status(400).json({ status: 'error', message: 'Invalid signature' });
        }
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// @route   GET /api/payments/receipt/:registrationId
// @desc    Download payment receipt
// @access  Private
router.get('/receipt/:registrationId', authMiddleware, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.registrationId)
            .populate('event')
            .populate('user');

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        // Ensure user owns this registration
        if (registration.user._id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (registration.paymentStatus !== 'Completed') {
            return res.status(400).json({ error: 'Payment not completed for this registration' });
        }

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const helveticaNode = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helveticaRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Header
        page.drawText('PAYMENT RECEIPT', { x: 200, y: 350, size: 24, font: helveticaNode, color: rgb(0.1, 0.1, 0.4) });
        page.drawLine({ start: { x: 50, y: 330 }, end: { x: 550, y: 330 }, thickness: 2, color: rgb(0.8, 0.8, 0.8) });

        // Body
        page.drawText(`Event: ${registration.event.title}`, { x: 50, y: 290, size: 14, font: helveticaRegular });
        page.drawText(`Participant Name: ${registration.user.name}`, { x: 50, y: 260, size: 14, font: helveticaRegular });
        page.drawText(`Date: ${new Date(registration.createdAt).toLocaleDateString()}`, { x: 50, y: 230, size: 14, font: helveticaRegular });

        page.drawText(`Amount Paid: INR ${registration.event.registrationFee}`, { x: 50, y: 190, size: 16, font: helveticaNode, color: rgb(0, 0.5, 0) });
        page.drawText(`Order ID: ${registration.razorpayOrderId}`, { x: 50, y: 160, size: 12, font: helveticaRegular });
        page.drawText(`Payment ID: ${registration.razorpayPaymentId}`, { x: 50, y: 140, size: 12, font: helveticaRegular });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt_${registration._id}.pdf`);
        res.send(Buffer.from(pdfBytes));
    } catch (err) {
        console.error('Error generating receipt:', err);
        res.status(500).json({ error: 'Server error generating receipt' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

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
        res.status(500).json({ error: "Something went wrong while creating order", details: err });
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

module.exports = router;

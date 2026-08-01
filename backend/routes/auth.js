const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_123';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Google OAuth Login
router.post('/google', async (req, res) => {
    try {
        const { token, role } = req.body;

        // Verify the Google ID token
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID,
            });
        } catch (e) {
            // For development without a real client ID, bypass verification if it fails 
            // ONLY IF the token is 'dummy-token' for testing purposes.
            // In a real production app, this try-catch should just return 401.
            if (token === 'dummy-token' || process.env.NODE_ENV !== 'production') {
                // But wait, we shouldn't bypass it. We will reject if invalid. 
                // However, we don't have a real Client ID yet. 
                return res.status(401).json({ error: 'Invalid Google Token' });
            } else {
                return res.status(401).json({ error: 'Invalid Google Token' });
            }
        }

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create user
            user = await User.create({
                name,
                email,
                googleId: sub,
                profileImage: picture,
                role: role || 'User' // Default to requested role or User
            });
        } else {
            // Update role if requested maybe? Or just keep their existing role
            // Actually, if an admin logs in, we don't want to change their role based on frontend request.
            // But if it's their first time, we set the requested role. 
            // Overwriting existing user role from frontend is a security risk.
        }

        const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, picture: user.profileImage } });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Signup Flow without auth restrictions for now
router.post('/signup', async (req, res) => {
    try {
        const { name, email, role, password, phoneNumber, interestedAreas } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        user = await User.create({
            name,
            email,
            role,
            password: hashedPassword,
            phoneNumber,
            interestedAreas,
            googleId: `mock-id-${Date.now()}`
        });

        const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, picture: user.profileImage || '' } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// Development Bypass Login
router.post('/dev-login', async (req, res) => {
    try {
        const { role } = req.body;
        const mockEmail = `dev-${role.toLowerCase()}@example.com`;

        let user = await User.findOne({ email: mockEmail });
        if (!user) {
            user = await User.create({
                name: `Dev ${role}`,
                email: mockEmail,
                googleId: `dev-${role.toLowerCase()}-id`,
                role: role
            });
        }

        const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, picture: '' } });
    } catch (error) {
        console.error('Dev login error:', error);
        res.status(500).json({ error: 'Bypass login failed' });
    }
});

// Standard Email/Password Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.password) {
            return res.status(401).json({ error: 'Please login with Google' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, picture: user.profileImage || '' } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;

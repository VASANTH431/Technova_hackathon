const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_123';

// Google OAuth Login Removed

// Signup Flow without auth restrictions for now
router.post('/signup', async (req, res) => {
    try {
        const { name, email, role, password, phoneNumber, interestedAreas, location } = req.body;

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
            location
            // removed mock google id
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
            return res.status(401).json({ error: 'No password set for this account. Please reset or contact support.' });
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

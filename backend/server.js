const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const path = require('path');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/user', require('./routes/user'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event-booking';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

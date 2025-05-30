const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://crime-incidence-frontend.onrender.com'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Connect to database
connectDB();

// Import routes
const incidentsRoutes = require('./routes/incidentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const specialInstructionsRoutes = require('./routes/specialInstructions');
const citizenRequestsRoutes = require('./routes/citizenRequests');
const agreementsRoutes = require('./routes/agreements');
const userRoutes = require('./routes/user');

// Routes
app.use('/api/incidents', incidentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/special-instructions', specialInstructionsRoutes);
app.use('/api/citizen-requests', citizenRequestsRoutes);
app.use('/api/agreements', agreementsRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const profileRoutes = require('./routes/profileRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/profiles', profileRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Recruitment API is running' });
});

// Test DB connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            message: 'Database connected successfully',
            time: result.rows[0].now
        });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

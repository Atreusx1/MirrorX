const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', postRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
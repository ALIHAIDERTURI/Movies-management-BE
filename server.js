const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/moviesRoutes');
const cors = require('cors');

// Enable CORS for all origins



dotenv.config();
connectDB();

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


const mongoose = require('mongoose');

app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState; // 1: connected, 0: disconnected, 2: connecting, 3: disconnecting
    let statusMessage = '';
    switch (dbStatus) {
        case 0:
            statusMessage = 'Database disconnected';
            break;
        case 1:
            statusMessage = 'Database connected';
            break;
        case 2:
            statusMessage = 'Database connecting';
            break;
        case 3:
            statusMessage = 'Database disconnecting';
            break;
        default:
            statusMessage = 'Unknown database status';
    }
    
    res.send(`Movie Management API is Running...! Database Status: ${statusMessage}`);
});



app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

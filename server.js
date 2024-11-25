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
    origin: 'http://localhost:5173', // your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  app.use(cors(corsOptions));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/', (req, res) => res.send('API is running...'));


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin:[ 'http://localhost:5173',
    "https://link-vault-smoky.vercel.app"
  ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes 
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/collections', collectionRoutes);



app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'LinkVault API is running 🚀' });
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
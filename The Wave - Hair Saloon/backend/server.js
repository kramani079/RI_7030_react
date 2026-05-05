import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import bookingRoutes from './routes/bookingRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import saleRoutes from './routes/saleRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/sales', saleRoutes);

// Test Route
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Backend is running and connected to MongoDB' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

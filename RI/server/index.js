const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Fix for ECONNREFUSED DNS issues on some networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/transactions', require('./routes/transactions'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

// Connect to MongoDB and seed data
const Product = require('./models/Product');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

async function seedData() {
  try {
    // Only seed if collections are empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding products...');
      await Product.insertMany([
        { productId: 'RI_1001', name: 'Gold Ring', stock: 120, lowStock: false, unitCost: 8000, production: { C: true, F: true, G: true, P: true } },
        { productId: 'RI_1002', name: 'Gold Chain', stock: 85, lowStock: false, unitCost: 5000, production: { C: true, F: true, G: true, P: false } },
        { productId: 'RI_1003', name: 'Diamond Necklace', stock: 3, lowStock: true, unitCost: 6000, production: { C: true, F: true, G: false, P: false } },
        { productId: 'RI_1004', name: 'Gold Bangle', stock: 200, lowStock: false, unitCost: 1400, production: { C: true, F: false, G: false, P: false } },
        { productId: 'RI_1005', name: 'Silver Earrings', stock: 4, lowStock: true, unitCost: 500, production: { C: false, F: false, G: false, P: false } },
      ]);
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log('Seeding orders...');
      await Order.insertMany([
        { orderId: 'RI_2001', customer: 'Mahesh Patel', email: 'mahesh@gmail.com', product: 'Gold Chain', productId: 'RI_1002', qty: 50, unitPrice: '5000', amount: '₹2,50,000', dueDate: 'Feb 28, 2026', production: { C: true, F: true, G: true, P: false }, status: 'In Production' },
        { orderId: 'RI_2002', customer: 'Ramesh Jewellers', email: 'ramesh@jewellers.com', product: 'Ring Set', productId: 'RI_1002', qty: 30, unitPrice: '3000', amount: '₹90,000', dueDate: 'Mar 2, 2026', production: { C: true, F: true, G: false, P: false }, status: 'In Production' },
        { orderId: 'RI_2003', customer: 'Vijay Exports', email: 'vijay@exports.com', product: 'Necklace', productId: 'RI_1003', qty: 20, unitPrice: '6000', amount: '₹1,20,000', dueDate: 'Mar 5, 2026', production: { C: true, F: false, G: false, P: false }, status: 'Pending' },
        { orderId: 'RI_2004', customer: 'Anita Stores', email: 'anita@stores.com', product: 'Earrings', productId: 'RI_1005', qty: 100, unitPrice: '500', amount: '₹50,000', dueDate: 'Mar 7, 2026', production: { C: true, F: true, G: true, P: true }, status: 'Ready' },
        { orderId: 'RI_2005', customer: 'Suresh Traders', email: 'suresh@traders.com', product: 'Silver Earrings', productId: 'RI_1005', qty: 200, unitPrice: '200', amount: '₹40,000', dueDate: 'Feb 15, 2026', production: { C: true, F: true, G: true, P: true }, status: 'Delivered' },
      ]);
    }

    const txCount = await Transaction.countDocuments();
    if (txCount === 0) {
      console.log('Seeding transactions...');
      await Transaction.insertMany([
        { txId: 'RI_3001', type: 'Sell', party: 'Mahesh Patel', product: 'Gold Ring', productId: 'RI_1001', qty: '10', amount: '₹80,000', rate: '8000', paymentMethod: 'Cash', date: 'Feb 24, 2026', status: 'Received' },
        { txId: 'RI_3002', type: 'Buy', party: 'Nikhil Supplier', product: 'Raw Gold', productId: 'RI_1001', qty: '5', amount: '₹22,500', rate: '4500', paymentMethod: 'Pending', date: 'Feb 23, 2026', status: 'Pending' },
        { txId: 'RI_3003', type: 'Sell', party: 'Ramesh Jewellers', product: 'Gold Chain', productId: 'RI_1002', qty: '5', amount: '₹35,000', rate: '7000', paymentMethod: 'UPI', date: 'Feb 22, 2026', status: 'Received' },
        { txId: 'RI_3004', type: 'Buy', party: 'Rajan Chemicals', product: 'Plating Chemicals', productId: 'RI_1004', qty: '10', amount: '₹10,000', rate: '1000', paymentMethod: 'Pending', date: 'Feb 21, 2026', status: 'Pending' },
        { txId: 'RI_3005', type: 'Sell', party: 'Suresh Traders', product: 'Gold Bangle', productId: 'RI_1004', qty: '20', amount: '₹28,000', rate: '1400', paymentMethod: 'Bank Transfer', date: 'Feb 20, 2026', status: 'Cancelled' },
      ]);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding default admin user...');
      await User.create({ name: 'Admin', email: 'admin@ri.com', password: 'admin123', role: 'Admin' });
      await User.create({ name: 'Employee User', email: 'emp@ri.com', password: 'emp123', role: 'Employee', salary: 25000 });
    }

    console.log('Seed check complete.');
  } catch (err) {
    console.error('⚠️ Seeding error (non-fatal):', err.message);
  }
}

const PORT = process.env.PORT || 5000;

// Mongoose connection with retry logic
let retryCount = 0;
const MAX_RETRIES = 5;

async function connectWithRetry() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB Atlas — ri_7030');
    retryCount = 0;
    await seedData();
  } catch (err) {
    retryCount++;
    console.error(`❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);
    console.dir(err);
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying in 5 seconds...`);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.error('❌ Max retries reached. Server will continue running without DB.');
      console.error('   API calls will return database errors gracefully.');
    }
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Will attempt reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB connection error:', err.message);
});

// Start server first, then connect DB (so health check works even without DB)
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  connectWithRetry();
});

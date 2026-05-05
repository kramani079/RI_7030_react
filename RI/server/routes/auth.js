const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Middleware to check DB connection
function checkDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database is currently unavailable. Please try again later.' });
  }
  next();
}

// POST /api/auth/register
router.post('/register', checkDB, async (req, res) => {
  try {
    const { name, email, password, role, phone, salary, fullName, mobile, address, employeeType } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      name: name || fullName || 'User',
      email: email.toLowerCase().trim(),
      password,
      role: role || 'Employee',
      phone: phone || mobile || '',
      salary: salary || 0,
    });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, salary: user.salary });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to register. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', checkDB, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.password !== password) return res.status(401).json({ error: 'Invalid password' });

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, salary: user.salary });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to login. Please try again.' });
  }
});

// PUT /api/auth/profile/:id
router.put('/profile/:id', checkDB, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, salary: user.salary });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to update profile. Please try again.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', checkDB, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to reset password. Please try again.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', checkDB, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.password !== currentPassword) return res.status(401).json({ error: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to change password. Please try again.' });
  }
});

// GET /api/auth/users — list all users (for employee management)
router.get('/users', checkDB, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to fetch users. Please try again.' });
  }
});

module.exports = router;

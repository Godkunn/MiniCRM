const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const router = express.Router();

// Get all customers with pagination and search
router.get('/', auth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {
      ownerId: req.user._id,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };

    const customers = await Customer.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(searchQuery);

    res.json({
      items: customers,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get single customer - Add validation for ObjectId
router.get('/:id', auth, async (req, res, next) => {
  try {
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid customer ID format' });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    }).populate('ownerId', 'name email');

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get leads for this customer
    const leads = await Lead.find({ customerId: req.params.id });

    res.json({ ...customer.toObject(), leads });
  } catch (error) {
    next(error);
  }
});

// Create customer
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, email, phone, company } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const customer = new Customer({
      name,
      email,
      phone,
      company,
      ownerId: req.user._id
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// Update customer - Add validation for ObjectId
router.put('/:id', auth, async (req, res, next) => {
  try {
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid customer ID format' });
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// Delete customer - Add validation for ObjectId
router.delete('/:id', auth, async (req, res, next) => {
  try {
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid customer ID format' });
    }

    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete associated leads
    await Lead.deleteMany({ customerId: req.params.id });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
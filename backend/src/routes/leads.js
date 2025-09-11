// backend/src/routes/leads.js
const express = require('express');
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const router = express.Router();

// Get all leads for a customer
router.get('/customers/:customerId/leads', auth, async (req, res, next) => {
  try {
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    const query = { customerId: req.params.customerId };
    if (status) {
      query.status = status;
    }

    const leads = await Lead.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    res.json({
      items: leads,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get single lead
router.get('/customers/:customerId/leads/:leadId', auth, async (req, res, next) => {
  try {
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const lead = await Lead.findOne({
      _id: req.params.leadId,
      customerId: req.params.customerId
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// Create lead
router.post('/customers/:customerId/leads', auth, async (req, res, next) => {
  try {
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const lead = new Lead({
      ...req.body,
      customerId: req.params.customerId
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
});

// Update lead
router.put('/customers/:customerId/leads/:leadId', auth, async (req, res, next) => {
  try {
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.leadId, customerId: req.params.customerId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// Delete lead
router.delete('/customers/:customerId/leads/:leadId', auth, async (req, res, next) => {
  try {
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const lead = await Lead.findOneAndDelete({
      _id: req.params.leadId,
      customerId: req.params.customerId
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
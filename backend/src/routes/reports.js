// backend/src/routes/reports.js
const express = require('express');
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const router = express.Router();

// Get leads by status report
router.get('/leads-by-status', auth, async (req, res, next) => {
  try {
    // Get all customer IDs for the current user
    const customerIds = await Customer.find({ ownerId: req.user._id }).distinct('_id');
    
    // Aggregate leads by status
    const leadsByStatus = await Lead.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    // Format the response
    const result = {
      New: { count: 0, totalValue: 0 },
      Contacted: { count: 0, totalValue: 0 },
      Converted: { count: 0, totalValue: 0 },
      Lost: { count: 0, totalValue: 0 }
    };

    leadsByStatus.forEach(item => {
      result[item._id] = {
        count: item.count,
        totalValue: item.totalValue || 0
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
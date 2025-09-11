const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

const createDemoData = async (userId) => {
  try {
    const demoCustomers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        company: 'ABC Corporation',
        ownerId: userId
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 (555) 987-6543',
        company: 'XYZ Enterprises',
        ownerId: userId
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+1 (555) 456-7890',
        company: 'Johnson & Co',
        ownerId: userId
      }
    ];

    const createdCustomers = await Customer.insertMany(demoCustomers);

    const demoLeads = [];
    const statuses = ['New', 'Contacted', 'Converted', 'Lost'];
    
    createdCustomers.forEach(customer => {
      for (let i = 0; i < 3; i++) {
        demoLeads.push({
          customerId: customer._id,
          title: `Lead ${i + 1} for ${customer.name}`,
          description: `This is a sample lead description for ${customer.name}.`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          value: Math.floor(Math.random() * 10000) + 1000,
          createdAt: new Date()
        });
      }
    });

    await Lead.insertMany(demoLeads);

    return {
      customers: createdCustomers.length,
      leads: demoLeads.length
    };
  } catch (error) {
    console.error('Error creating demo data:', error);
    throw error;
  }
};

module.exports = { createDemoData };
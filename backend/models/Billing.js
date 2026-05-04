const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  amount: Number,
  status: String
});

module.exports = mongoose.model('Billing', billingSchema);
const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
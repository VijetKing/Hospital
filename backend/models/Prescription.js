const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  medicine: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
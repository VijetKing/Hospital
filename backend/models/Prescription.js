const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  medicines: String
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
const express = require('express');

const router = express.Router();

const Prescription = require('../models/Prescription');


// GET ALL PRESCRIPTIONS
router.get('/', async (req, res) => {

  try {

    const prescriptions = await Prescription.find()
      .populate('patientId')
      .populate('doctorId');

    res.json(prescriptions);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});


// ADD PRESCRIPTION
router.post('/', async (req, res) => {

  try {

    const prescription = new Prescription({
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      medicine: req.body.medicine
    });

    const savedPrescription = await prescription.save();

    res.status(201).json(savedPrescription);

  } catch (error) {

    console.log(error);

    res.status(400).json({
      message: error.message
    });

  }

});

// DELETE PRESCRIPTION
router.delete('/:id', async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
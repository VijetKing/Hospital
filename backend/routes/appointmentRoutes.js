const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

router.get('/', async (req, res) => {
  const data = await Appointment.find().populate('patientId doctorId');
  res.json(data);
});

router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, date, status } = req.body;

    if (!patientId || !doctorId || !date)
      return res.status(400).json({ error: "All fields required" });

    const newAppointment = new Appointment({ patientId, doctorId, date, status: status || 'Scheduled' });
    await newAppointment.save();

    res.json(newAppointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
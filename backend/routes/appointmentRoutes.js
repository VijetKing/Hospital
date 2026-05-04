const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

router.post('/', async (req, res) => {
  const data = await Appointment.create(req.body);
  res.json(data);
});

router.get('/', async (req, res) => {
  const data = await Appointment.find().populate('patientId doctorId');
  res.json(data);
});

module.exports = router;
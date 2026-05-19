const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

router.get('/', async (req, res) => {
  const data = await Patient.find();
  res.json(data);
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Name required" });

    const newPatient = new Patient({ name });
    await newPatient.save();

    res.json(newPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
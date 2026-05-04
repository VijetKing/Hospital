const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

router.get('/', async (req, res) => {
  const data = await Doctor.find();
  res.json(data);
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Name required" });

    const newDoctor = new Doctor({ name });
    await newDoctor.save();

    res.json(newDoctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
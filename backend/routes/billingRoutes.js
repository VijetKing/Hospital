const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');

router.get('/', async (req, res) => {
  const data = await Billing.find().populate('patientId');
  res.json(data);
});

router.post('/', async (req, res) => {
  try {
    const { patientId, amount } = req.body;

    if (!patientId || !amount)
      return res.status(400).json({ error: "All fields required" });

    const newBill = new Billing({ patientId, amount });
    await newBill.save();

    res.json(newBill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Billing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
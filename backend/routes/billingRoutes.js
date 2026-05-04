const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');

router.post('/', async (req, res) => {
  const data = await Billing.create(req.body);
  res.json(data);
});

router.get('/', async (req, res) => {
  const data = await Billing.find().populate('patientId');
  res.json(data);
});

module.exports = router;
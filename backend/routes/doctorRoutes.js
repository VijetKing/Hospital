const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

router.post('/', async (req, res) => {
  const data = await Doctor.create(req.body);
  res.json(data);
});

router.get('/', async (req, res) => {
  const data = await Doctor.find();
  res.json(data);
});

module.exports = router;
const express = require('express');
const router = express.Router();

const Patient = require('../models/Patient');

// CREATE
router.post('/', async (req, res) => {
  const data = await Patient.create(req.body);
  res.json(data);
});

// READ
router.get('/', async (req, res) => {
  const data = await Patient.find();
  res.json(data);
});

module.exports = router;
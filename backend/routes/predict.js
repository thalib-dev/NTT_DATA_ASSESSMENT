const express = require('express');
const router = express.Router();
const db = require('../db/database');

const ML_SERVICE_URL = (process.env.ML_SERVICE_URL || 'http://localhost:5000').replace(/\/+$/, '');

// POST predict risk for a machine
router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get machine data
    const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found.' });
    }

    const machineData = JSON.parse(machine.data);

    // Send to Python ML service
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machineData)
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return res.status(502).json({
        error: errBody.error || 'ML service returned an error.',
        details: errBody
      });
    }

    const prediction = await response.json();
    res.json({
      machine_id: machine.id,
      machine_data: machineData,
      prediction
    });
  } catch (err) {
    if (err.cause && err.cause.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'ML service is not running. Please start the Python ML service on port 5000.'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

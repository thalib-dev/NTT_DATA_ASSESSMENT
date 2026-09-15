const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Helper: get all field configurations
function getFieldConfigs() {
  const fields = db.prepare('SELECT * FROM field_configurations ORDER BY display_order ASC').all();
  return fields.map(f => ({
    ...f,
    is_required: Boolean(f.is_required),
    dropdown_options: f.dropdown_options ? JSON.parse(f.dropdown_options) : null
  }));
}

// Helper: validate machine data against field configurations
function validateMachineData(data, fields) {
  const errors = [];

  for (const field of fields) {
    const value = data[field.field_name];

    // Check required fields
    if (field.is_required && (value === undefined || value === null || value === '')) {
      errors.push(`"${field.field_name}" is required.`);
      continue;
    }

    // Skip validation if optional and empty
    if (value === undefined || value === null || value === '') continue;

    // Type validation
    if (field.field_type === 'number' && isNaN(Number(value))) {
      errors.push(`"${field.field_name}" must be a number.`);
    }

    if (field.field_type === 'dropdown') {
      const options = field.dropdown_options || [];
      if (!options.includes(value)) {
        errors.push(`"${field.field_name}" must be one of: ${options.join(', ')}.`);
      }
    }
  }

  return errors;
}

// GET all machines
router.get('/', (req, res) => {
  try {
    const machines = db.prepare('SELECT * FROM machines ORDER BY created_at DESC').all();
    const parsed = machines.map(m => ({
      ...m,
      data: JSON.parse(m.data)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single machine
router.get('/:id', (req, res) => {
  try {
    const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found.' });
    }
    res.json({
      ...machine,
      data: JSON.parse(machine.data)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create machine
router.post('/', (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Machine data is required.' });
    }

    const fields = getFieldConfigs();
    const errors = validateMachineData(data, fields);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    // Cast number fields
    const cleanData = { ...data };
    for (const field of fields) {
      if (field.field_type === 'number' && cleanData[field.field_name] !== undefined && cleanData[field.field_name] !== '') {
        cleanData[field.field_name] = Number(cleanData[field.field_name]);
      }
    }

    const stmt = db.prepare('INSERT INTO machines (data) VALUES (?)');
    const result = stmt.run(JSON.stringify(cleanData));

    const created = db.prepare('SELECT * FROM machines WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      ...created,
      data: JSON.parse(created.data)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update machine
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const existing = db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Machine not found.' });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Machine data is required.' });
    }

    const fields = getFieldConfigs();
    const errors = validateMachineData(data, fields);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    // Cast number fields
    const cleanData = { ...data };
    for (const field of fields) {
      if (field.field_type === 'number' && cleanData[field.field_name] !== undefined && cleanData[field.field_name] !== '') {
        cleanData[field.field_name] = Number(cleanData[field.field_name]);
      }
    }

    const stmt = db.prepare("UPDATE machines SET data = ?, updated_at = datetime('now') WHERE id = ?");
    stmt.run(JSON.stringify(cleanData), id);

    const updated = db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
    res.json({
      ...updated,
      data: JSON.parse(updated.data)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE machine
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Machine not found.' });
    }

    db.prepare('DELETE FROM machines WHERE id = ?').run(id);
    res.json({ message: 'Machine deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

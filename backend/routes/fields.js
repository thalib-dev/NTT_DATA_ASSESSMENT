const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all fields
router.get('/', (req, res) => {
  try {
    const fields = db.prepare('SELECT * FROM field_configurations ORDER BY display_order ASC').all();
    const parsed = fields.map(f => ({
      ...f,
      is_required: Boolean(f.is_required),
      dropdown_options: f.dropdown_options ? JSON.parse(f.dropdown_options) : null
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a field
router.post('/', (req, res) => {
  try {
    const { field_name, field_type, is_required, dropdown_options } = req.body;

    // Validation
    if (!field_name || !field_name.trim()) {
      return res.status(400).json({ error: 'Field name is required.' });
    }
    if (!['text', 'number', 'dropdown'].includes(field_type)) {
      return res.status(400).json({ error: 'Field type must be text, number, or dropdown.' });
    }
    if (field_type === 'dropdown' && (!dropdown_options || !Array.isArray(dropdown_options) || dropdown_options.length === 0)) {
      return res.status(400).json({ error: 'Dropdown fields must have at least one option.' });
    }

    // Get next display order
    const maxOrder = db.prepare('SELECT MAX(display_order) as max_order FROM field_configurations').get();
    const nextOrder = (maxOrder.max_order || 0) + 1;

    const stmt = db.prepare(`
      INSERT INTO field_configurations (field_name, field_type, is_required, dropdown_options, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      field_name.trim(),
      field_type,
      is_required ? 1 : 0,
      field_type === 'dropdown' ? JSON.stringify(dropdown_options) : null,
      nextOrder
    );

    const created = db.prepare('SELECT * FROM field_configurations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      ...created,
      is_required: Boolean(created.is_required),
      dropdown_options: created.dropdown_options ? JSON.parse(created.dropdown_options) : null
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'A field with this name already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update a field
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { field_name, field_type, is_required, dropdown_options } = req.body;

    const existing = db.prepare('SELECT * FROM field_configurations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Field not found.' });
    }

    if (!field_name || !field_name.trim()) {
      return res.status(400).json({ error: 'Field name is required.' });
    }
    if (!['text', 'number', 'dropdown'].includes(field_type)) {
      return res.status(400).json({ error: 'Field type must be text, number, or dropdown.' });
    }
    if (field_type === 'dropdown' && (!dropdown_options || !Array.isArray(dropdown_options) || dropdown_options.length === 0)) {
      return res.status(400).json({ error: 'Dropdown fields must have at least one option.' });
    }

    const stmt = db.prepare(`
      UPDATE field_configurations
      SET field_name = ?, field_type = ?, is_required = ?, dropdown_options = ?
      WHERE id = ?
    `);

    stmt.run(
      field_name.trim(),
      field_type,
      is_required ? 1 : 0,
      field_type === 'dropdown' ? JSON.stringify(dropdown_options) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM field_configurations WHERE id = ?').get(id);
    res.json({
      ...updated,
      is_required: Boolean(updated.is_required),
      dropdown_options: updated.dropdown_options ? JSON.parse(updated.dropdown_options) : null
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'A field with this name already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE a field
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM field_configurations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Field not found.' });
    }

    db.prepare('DELETE FROM field_configurations WHERE id = ?').run(id);
    res.json({ message: 'Field deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

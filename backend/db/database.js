const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'machines.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS field_configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_name TEXT NOT NULL UNIQUE,
    field_type TEXT NOT NULL CHECK(field_type IN ('text', 'number', 'dropdown')),
    is_required INTEGER DEFAULT 0,
    dropdown_options TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

const count = db.prepare('SELECT COUNT(*) as cnt FROM field_configurations').get();
if (count.cnt === 0) {
  const insert = db.prepare(`
    INSERT INTO field_configurations (field_name, field_type, is_required, dropdown_options, display_order)
    VALUES (@field_name, @field_type, @is_required, @dropdown_options, @display_order)
  `);

  const seedFields = [
    {
      field_name: 'Machine Name',
      field_type: 'text',
      is_required: 1,
      dropdown_options: null,
      display_order: 1
    },
    {
      field_name: 'Temperature',
      field_type: 'number',
      is_required: 1,
      dropdown_options: null,
      display_order: 2
    },
    {
      field_name: 'Pressure',
      field_type: 'number',
      is_required: 1,
      dropdown_options: null,
      display_order: 3
    },
    {
      field_name: 'Vibration',
      field_type: 'dropdown',
      is_required: 1,
      dropdown_options: JSON.stringify(['Low', 'Medium', 'High']),
      display_order: 4
    }
  ];

  const insertMany = db.transaction((fields) => {
    for (const field of fields) {
      insert.run(field);
    }
  });

  insertMany(seedFields);
  console.log('Database seeded with default field configurations.');
}

module.exports = db;

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

const fs = require('fs');

// Serve static frontend files if available
const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');
if (fs.existsSync(frontendPublicPath)) {
  app.use(express.static(frontendPublicPath));
}

// API Routes
app.use('/api/fields', require('./routes/fields'));
app.use('/api/machines', require('./routes/machines'));
app.use('/api/predict', require('./routes/predict'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ML service health proxy (avoids CORS issues for frontend)
const ML_SERVICE_URL = (process.env.ML_SERVICE_URL || 'http://localhost:5000').replace(/\/+$/, '');
app.get('/api/ml-health', async (req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await response.json();
    res.json(data);
  } catch {
    res.json({ status: 'offline' });
  }
});

// Fallback for non-API routes
app.use((req, res) => {
  const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: 'Machine Data Management API is active',
      endpoints: ['/api/machines', '/api/fields', '/api/predict', '/api/health', '/api/ml-health']
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n    Machine Data Management Server`);
  console.log(`  ────────────────────────────────────`);
  console.log(`   Web UI:  http://localhost:${PORT}`);
  console.log(`   API:     http://localhost:${PORT}/api`);
  console.log(`  ────────────────────────────────────\n`);
});

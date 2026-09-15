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

function getMlUrl() {
  if (process.env.ML_SERVICE_URL) {
    return process.env.ML_SERVICE_URL.replace(/\/+$/, '');
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN.replace(/backend/i, 'ml-service');
    return `https://${domain}`;
  }
  return 'http://localhost:5000';
}

// ML service health proxy (avoids CORS issues for frontend)
app.get('/api/ml-health', async (req, res) => {
  try {
    const mlUrl = getMlUrl();
    const response = await fetch(`${mlUrl}/health`, { signal: AbortSignal.timeout(3000) });
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
